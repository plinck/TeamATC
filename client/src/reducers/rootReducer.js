const initState = {
  activities: []
}

const rootReducer = (state = initState, action) => {
    // console.log(action);
    if (action.type === 'DELETE_ACTIVITY') {
        let newActivities = state.activities.filter(activity => {
            return activity.id !== action.id;
        });
        return {
            ...state,
            activities: newActivities
        }
    }
    if (action.type === 'MODIFY_ACTIVITY') {
        let newActivities = state.activities.filter(activity => {
            if (activity.id === action.activity.id) {
                return action.activity;
            } else {
                return activity;
            }
        });
        return {
            ...state,
            activities: newActivities
        }
    }
    if (action.type === 'ADD_ACTIVITY') {
        let newActivities = state.activities;
        newActivities.push(action.activity);
        return {
            ...state,
            activities: newActivities
        }
    }
    return state;
}

export default rootReducer