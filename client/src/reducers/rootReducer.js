const initState = {
  activities: [],
  nbrActivities: 0
}

const rootReducer = (state = initState, action) => {
    // console.log(action);'
    if (action.type === 'DELETE_ACTIVITY') {
        let newActivities = state.activities.filter(activity => {
            return activity.id !== action.id;
        });
        let newNbr = state.nbrActivities - 1;
        return {
            ...state,
            activities: newActivities,
            nbrActivities: newNbr
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
        let newNbr = state.nbrActivities - 1;
        return {
            ...state,
            activities: newActivities,
            nbrActivities: newNbr
        }
    }
    return state;
}

export default rootReducer