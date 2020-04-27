const initState = {
    nbrUpdates: 0,
    activities: []
}

// MUST RETURN NEW STATE not just MUTATE
const rootReducer = (state = initState, action) => {
    // console.log(action);'
    if (action.type === 'DELETE_ACTIVITY') {
        let newActivities = state.activities.filter(activity => {
            return activity.id !== action.id;
        });
        let newNbrUpdates =  state.nbrUpdates + 1;
        return {
            ...state,
            nbrUpdates: newNbrUpdates,
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
        let newNbrUpdates =  state.nbrUpdates + 1;
        return {
            ...state,
            nbrUpdates: newNbrUpdates,
            activities: newActivities
        }
    }
    if (action.type === 'ADD_ACTIVITY') {
        let newActivities = state.activities;
        newActivities.push(action.activity);
        let newNbrUpdates =  state.nbrUpdates + 1;
        return {
            ...state,
            nbrUpdates: newNbrUpdates,
            activities: newActivities
        }
    }
    return state;
}

export default rootReducer