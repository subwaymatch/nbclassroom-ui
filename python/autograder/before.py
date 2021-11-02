# GRADER_ONLY
autograded_result = {
    "netid": None,
    "order": [],
    "student_score": 0,
    "total_available": 0,
    "breakdown": {}
}

def record_part(part_name, did_pass, available_points, message=""):
    global autograded_result
    
    # If already graded, remove previous graded order entry for this part
    if part_name in autograded_result["order"]:
        print("[Warning] Autograder: Part already graded or a duplicate key exists")
        autograded_result["order"].remove(part_name)
    
    # Record graded order
    autograded_result["order"].append(part_name)
    
    # Add graded result for this part
    autograded_result["breakdown"][part_name] = {
        "available_points": available_points,
        "points": available_points if did_pass else 0,
        "did_pass": did_pass,
        "message": message,
    }
    
    # Recalculate total_points and total_available points
    autograded_result["student_score"] = 0
    autograded_result["total_available"] = 0
    
    for part_info in autograded_result["breakdown"].values():
        autograded_result["student_score"] += part_info["points"]
        autograded_result["total_available"] += part_info["available_points"]
    
    print(autograded_result)