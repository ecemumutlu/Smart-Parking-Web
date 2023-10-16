from pydantic import BaseModel

class Location(BaseModel):
    segment_id: int
    start_loc_lat: float
    start_loc_long: float
    end_loc_lat: float
    end_loc_long: float
    
class Array2D(BaseModel):
    data: list
    
class KeyIndices(BaseModel):
    segment_id: int
    index: int