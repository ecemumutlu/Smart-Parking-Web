from fastapi.responses import JSONResponse
import gridfs
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from model import Location, Array2D, KeyIndices
from dotenv import load_dotenv
import os
import pandas as pd
import pickle
from scipy.spatial import KDTree
from scipy.stats import norm
from tensorflow import keras 
from keras.models import load_model
from datetime import datetime
import numpy as np
import requests
from gridfs import GridFS
from bson import ObjectId
import logging
logging.basicConfig(level=logging.INFO)

load_dotenv()
MONGO_URL=os.getenv("MONGO_URL")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
import motor.motor_asyncio
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
database = client.smartparking
collection = database.segments
collection_ratios = database.test_data
collection_keys = database.key_dict
collection_ratios2 = database.test_data2



async def fetch_all_segments():
    segments = []
    cursor = collection.find({})
    async for document in cursor:
        segments.append(Location(**document))
    return segments

async def fetch_test_data():
    ratios = []
    cursor = collection_ratios.find({})
    async for document in cursor:
        ratios.append(Array2D(**document))
    
    return ratios

async def fetch_key_dict():
    keys = {}
    cursor = collection_keys.find({})
    async for document in cursor:
        element = KeyIndices(**document)
        keys[element.segment_id] = element.index
        
    return keys


async def read_ratios():
    loaded_data=pd.read_pickle("../backend/239_ratioMatrix_merged.pickle")
    return loaded_data

async def download_stream():
    my_db = AsyncIOMotorClient().test
    fs = AsyncIOMotorGridFSBucket(my_db)
    # get _id of file to read.
    file_id = await fs.upload_from_stream("test_file",
                                          b"data I want to store!")
    grid_out = await fs.open_download_stream(file_id)
    contents = await grid_out.read()
    

def find_place_id(api_key,coord_list_dict):
    # logging.info("coord_list_dict len:************", len(coord_list_dict))
    place_id_dict = {}
    seg_address_dict = {}
    base_url = 'https://maps.googleapis.com/maps/api/geocode/json'
    
    for segment_id, coord in coord_list_dict.items():
        params = {
            'latlng': f'{coord[0]},{coord[1]}',
            'key': api_key
        }

        response = requests.get(base_url, params=params)
        data = response.json()


        first_result = data['results'][0]
        place_id = first_result.get('place_id')
        address = first_result.get('formatted_address')

        place_id_dict[place_id] = segment_id
        seg_address_dict[segment_id] = address
     
    return place_id_dict, seg_address_dict


async def find_closest_ten(lat,lng):
    segments = []
    cursor = collection.find({})
    async for document in cursor:
        segments.append(Location(**document))
        
    # Coordinates of the 239 places in a list of tuples [(lat, lon), ...]  
    places_coordinates = []
    for seg in segments:
        places_coordinates.append((seg.start_loc_lat, seg.start_loc_long))   
        places_coordinates.append((seg.end_loc_lat, seg.end_loc_long)) 
        
    # Build a KD-Tree for starting coordinates
    places_kd_tree = KDTree(places_coordinates)

    # Function to find the closest places to a given destination
    k = 20
    
    distances, indices = places_kd_tree.query([(lat,lng)], k=k)
    closest_places = [(places_coordinates[i], distance) for i, distance in zip(indices[0], distances[0])]
    selected_segments_dict , seg_cap_dict, error_dist_dict, matrix_index_dict = await find_segment_id_from_coordinates(closest_places)

    return {"selected_seg_dict":selected_segments_dict , "seg_cap_dict":seg_cap_dict, "error_dist_dict":error_dist_dict, "matrix_index_dict":matrix_index_dict}

def calculate_distances(origins, destination, mode, api_key):
    
    API_KEY = api_key
        
    base_url = 'https://maps.googleapis.com/maps/api/distancematrix/json'

    params = {
        'origins': '|'.join(origins),
        'destinations': destination,
        'key': API_KEY,
        'mode': mode
    }

    response = requests.get(base_url, params=params)
    data = response.json()
    
    return data


def format_date(current_time):
    date, time = current_time.split(' ')
    year, month, day = date.split('/')
    
    date_string = year + "-" + month + "-" + '5' + " " + time
    date_format = "%Y-%m-%d %H:%M:%S"

    parsed_date = datetime.strptime(date_string, date_format)
    return parsed_date

def string_sep_time(car_duration):
    dur_list = car_duration.split(' ')
    len_list = len(dur_list)
    total_min = 0
    for i in range(0,len_list,2):
        if(dur_list[i+1] == "days"):
            total_min += int(dur_list[i]) * 24 * 60
        elif(dur_list[i+1] == "hours"):
            total_min += int(dur_list[i]) * 60
        else:
            total_min += int(dur_list[i])
            
    return total_min
            
           
def string_sep_distance(distance):
    string_dist, unit_dist = distance.split(' ')
    walking_dist = -1
    if(unit_dist == "km"):
        if(',' in string_dist):
            walking_dist1, walking_dist2 = string_dist.split(',')
            walking_dist = walking_dist1 + walking_dist2
            walking_dist = float(walking_dist) * 1000
        else:
            walking_dist = float(string_dist) * 1000
    else:
        walking_dist = float(string_dist)
    return walking_dist


#give 30 inputs to the model and get 6 next
async def make_prediction(segment_id_dict, seg_cap_dict, error_dist_dict, matrix_index_dict, current_time, dest_lat, dest_lng, current_loc, selected_option):
    
    # #print(current_loc) # in the format of [-37.8388305, 144.9418181]

    #todo: bu input olaraK GELMELİ
    current_time = "2019/07/05 14:17:00"
    
    parsed_date = format_date(current_time)  
    #print(parsed_date) # in the format of 2019-02-05 12:25:22
    time_intervals = pd.date_range("2019-01-01 00:00", "2019-12-31 23:55", freq='5T')  #time_intervals = time_intervals[8000:10000]
    
 
    # --------------------------------------Load model ---------------------------------------------#
    model = load_model("../modelfiles/LSTM_sixstep_allsegments.keras")
    
    
    #---------------------------Find segment_ids of closest 10 places ------------------------------#
    #segment_id_dict, segment_id_list = await find_segment_id_from_coordinates(closest_places)
    segment_id_list = list(segment_id_dict.keys())
    
    
    ratios_all = await read_ratios()
    

    # --------------------- Find the index of the interval in which the date resides--------------- #
    interval_index = time_intervals.searchsorted(parsed_date) + 1
    
    #------------------------- Reshape input to give as prediction input ---------------------------#
    model_input = ratios_all[:,interval_index - 30:interval_index ].reshape((1,239,30))
    
    #----------------------------------------Make prediction--------------------------------------- #
    prediction_next_6 = model.predict(model_input)
    
    # --------------------------Calculate walking meters from segments to destination---------------#
    API_KEY = GOOGLE_API_KEY
    
    place_id_dict, seg_address_dict = find_place_id(API_KEY,segment_id_dict)

    origins = []
    # for key,cor in segment_id_dict.items():
    #     origins.append(str(cor[0]) + ',' + str(cor[1]))
    
    for place_id,segment_id in place_id_dict.items():
        origins.append("place_id:" + str(place_id))

    origins2 = []
    for segment_id, address in seg_address_dict.items():
        origins2.append(address)
        

    walking_metadata = calculate_distances(origins2, str(dest_lat) + "," + str(dest_lng), 'walking', API_KEY)
    car_travel_metadata = calculate_distances(origins2, str(current_loc[0]) + "," + str(current_loc[1]), 'driving', API_KEY)

    
    #-------------------------Calculate car travel time if origin is supplied ----------------------#
    segment_metadata = {}
    index_row = 0
    rows = walking_metadata['rows']
    rows_car = car_travel_metadata['rows']

    for segment_id, coord in seg_address_dict.items():
        distance = rows[index_row]['elements'][0]['distance']['text']
        duration = rows[index_row]['elements'][0]['duration']['text']

        car_distance = rows_car[index_row]['elements'][0]['distance']['text']
        car_duration = rows_car[index_row]['elements'][0]['duration']['text']

        walking_dist = string_sep_distance(distance)
        walking_travel_time_min = string_sep_time(duration)

        car_distance_float = string_sep_distance(car_distance)
        car_travel_time_min = string_sep_time(car_duration)

        segment_metadata[segment_id] = {
            'walking_distance': walking_dist,
            'walking_duration': walking_travel_time_min,
            'car_distance': car_distance_float, 
            'car_duration': car_travel_time_min,
            'seg_total_dur': walking_travel_time_min + car_travel_time_min
        }
        index_row += 1
        
    prediction_next_6_dict = get_pred_for_10_seg(matrix_index_dict,prediction_next_6[0].tolist())
    
    # what we need
    #prediction_next_6 # -> next 6 value prediction for all segments
    segment_id_list # -> segments ids in a list format
    seg_cap_dict # -> seg_id: capacity_list [12]
    matrix_index_dict # -> seg_id: matrix_index [10]
    error_dist_dict # -> seg_id: error_dist_list [6]
    prediction_next_6_dict # -> predicted values for our 10 segments
    #segment_metadata[segment_id] # ->         segment_metadata[segment_id] = {
                                                #     'walking_distance': walking_dist,
                                                #     'walking_duration': walking_travel_time_min,
                                                #     'car_distance': "" , 
                                                #     'car_duration': "",
                                                # }
             
    #use naive model results if the total travel time is more than 30
    naive_model_data = ratios_all[:, interval_index - 2016 : interval_index]  
    #print(naive_model_data)     
    naive_model_10seg_dict = get_pred_for_10_seg(matrix_index_dict, naive_model_data)
        
    travel_time_list = []
    walking_distance_list = []
    likelihood_list = []   
    pred_ratio_acc_time={}
    curr_month = parsed_date.month                          
    for seg_id in segment_id_list:
        segment = segment_metadata[seg_id]
        total_travel_time= segment['seg_total_dur'] # in minutes
        walking_distance_in_m = segment['walking_distance'] # in meters
        travel_time_list.append(total_travel_time)
        
        walking_distance_list.append(walking_distance_in_m)
        
        index_5t = int(total_travel_time // 5)
        if( index_5t >= 6): #use naive
            pred = naive_model_10seg_dict[seg_id][index_5t]
            error_dist = error_dist_dict[seg_id][6]
        else:
            error_dist = error_dist_dict[seg_id][index_5t]
            pred = prediction_next_6_dict[seg_id][index_5t]
            
        mean = error_dist[0]
        standard_dev = error_dist[1]
        pred_ratio_acc_time[seg_id] = pred
        
        capacity = seg_cap_dict[seg_id][curr_month-1]
        value = (capacity * (1 - pred - mean) - 1) / (capacity * standard_dev )
        likelihood_list.append(norm.cdf(value))

    travel_time_list = np.array(travel_time_list)
    likelihood_list = np.array(likelihood_list)
    walking_distance_list = np.array(walking_distance_list)
    
    travel_normalized = normalize_lists(travel_time_list)
    walking_normalized = normalize_lists(walking_distance_list)
    likelihood_normalized = 1 - normalize_lists(likelihood_list)
    
    likelihood_normalized_coeff = 0.30
    if(selected_option == 'Travel'):
        travel_normalized_coeff = 0.45
        walking_normalized_coeff = 0.25
    elif(selected_option == 'Walking'):
        travel_normalized_coeff = 0.25
        walking_normalized_coeff = 0.45
    else:
        travel_normalized_coeff = 0.35
        walking_normalized_coeff = 0.35
    
    result_list = travel_normalized * travel_normalized_coeff + walking_normalized * walking_normalized_coeff + likelihood_normalized * likelihood_normalized_coeff 
        
    #likelihood -> 30
    #preference -> 45
    #otherrrrrr -> 25
    #default -> 30, 35, 35

    tmp_ind = 0
    dtype = [('segment_id', int), ('coordinates', tuple), ('result', float), ('capacity', int), ('predicted_ratio', float),('segment_metadata',dict), ('segment_address', tuple)]
    result_np_array = np.empty(0, dtype=dtype)
    for seg_id, coord in segment_id_dict.items():
        our_str = seg_address_dict[seg_id]
        elem = (seg_id , coord, result_list[tmp_ind], seg_cap_dict[seg_id][curr_month-1], pred_ratio_acc_time[seg_id],segment_metadata[seg_id], (our_str))
        result_np_array = np.append(result_np_array, np.array(elem, dtype=dtype))
        tmp_ind+= 1
    sorted_np = np.sort(result_np_array, order='result')

    return sorted_np.tolist()
    
#coor_list is a list of tuples [(lat1,long1), (lat2,long2),...]


def normalize_lists(list_np):
    min_travel = min(list_np)
    max_travel = max(list_np)
    
    normalized = ( list_np - min_travel ) / (max_travel - min_travel)
    return normalized

def get_pred_for_10_seg(matrix_index_dict,prediction_next_6):
    #print(len(prediction_next_6))
    prediction_dict = {}
    for seg_id, index in matrix_index_dict.items():
        prediction_dict[seg_id] = prediction_next_6[index]
        
    return prediction_dict

async def find_capacity_and_error(segment_id_list: list):
    seg_cap_dict = {}
    error_dist_dict = {}
    matrix_index_dict = {}
    for seg in segment_id_list:
        query = {"segment_id": seg}
        matching_documents = collection.find(query) 
        new_elem = await matching_documents.to_list(length=1)
        seg_cap_dict[seg] = new_elem[0]['capacity']
        error_dist_dict[seg] = [new_elem[0]['error_dist1'] , new_elem[0]['error_dist2'], new_elem[0]['error_dist3'], new_elem[0]['error_dist4'], new_elem[0]['error_dist5'], new_elem[0]['error_dist6']]
        matrix_index_dict[seg] = new_elem[0]['matrix_index']
        
    return seg_cap_dict, error_dist_dict, matrix_index_dict

async def find_segment_id_from_coordinates(coor_list: list):
    selected_segments_dict = {}
    selected_segments = []
    
    seg_cap_dict = {}
    error_dist_dict = {}
    matrix_index_dict = {}
    
    len_list = len(coor_list)
    len_last = 0
    for i in range(len_list):
        coor = coor_list[i][0]
        query_s = {"start_loc_lat": coor[0], "start_loc_long": coor[1]}
        query_e = {"end_loc_lat": coor[0], "end_loc_long": coor[1]}
        matching_documents_s = collection.find(query_s) 
        matching_documents_e = collection.find(query_e) 
        new_elem_s = await matching_documents_s.to_list(length=1)
        new_elem_e = await matching_documents_e.to_list(length=1)

        if( new_elem_s != []):
            our_elem = new_elem_s
        elif( new_elem_e != []):
            our_elem = new_elem_e
            
        if( our_elem[0]['segment_id'] not in selected_segments_dict.keys() ):
            seg = int(our_elem[0]['segment_id'])
            selected_segments.append(seg)
            selected_segments_dict[seg] = coor
            seg_cap_dict[seg] = our_elem[0]['capacity']
            error_dist_dict[seg] = [our_elem[0]['error_dist1'] , our_elem[0]['error_dist2'], our_elem[0]['error_dist3'], our_elem[0]['error_dist4'], our_elem[0]['error_dist5'], our_elem[0]['error_dist6'],our_elem[0]['naive_error']]
            matrix_index_dict[seg] = our_elem[0]['matrix_index']
            len_last += 1
            
        if(len_last == 10):
            break
        
    return selected_segments_dict , seg_cap_dict, error_dist_dict, matrix_index_dict