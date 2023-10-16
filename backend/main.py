from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import (
fetch_all_segments,
fetch_test_data,
fetch_key_dict,
find_closest_ten,
make_prediction
)

app=FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3000/search"
]

# what is a middleware? 
# software that acts as a bridge between an operating system or database and applications, especially on a network.

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.get("/api/segments")
async def get_segments():
    response = await fetch_all_segments()
    return response

@app.get("/api/test_data")
async def get_ratios():
    response = await fetch_test_data()
    return response

@app.get("/api/key_dict")
async def get_key_dict():
    response = await fetch_key_dict()
    return response

@app.post("/api/closest_ten/")
async def get_closest_ten(coordinates: dict):
    if( coordinates == {}):
        return {}
    else:
        response = await find_closest_ten(coordinates['lat'], coordinates['lng'])
        return response
    

@app.post("/api/make_pred/")
async def get_prediction(param_dict: dict):
    if( param_dict == {}):
        return {}
    else:
        response = await make_prediction(param_dict['places'], 
                                        param_dict['seg_cap_dict'],
                                        param_dict['error_dist_dict'],
                                        param_dict['matrix_index_dict'],
                                        param_dict['time'], 
                                        param_dict['dest_lat'], 
                                        param_dict['dest_lng'], 
                                        param_dict['current_loc'], 
                                        param_dict['selected_option'])
        return response
    
# if __name__=='__main__':
#     uvicorn.run(app,port=8000)