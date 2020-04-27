// REDUX
import React from "react";
import Util from "../Util/Util";
import { connect } from 'react-redux'
import { addActivity, deleteActivity, modifyActivity } from "../../actions/activityAction.js"

class ActivityListener extends React.Component {

    constructor(props) {
        super(props)

        this.activityListener = undefined;
    }

    componentDidMount() {
        if (this.props && this.props.challengeUid) {
            this.createActivityListener(this.props.challengeUid)
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props && this.props.challengeUid !== prevProps.challengeUid) {
            this.createActivityListener(this.props.challengeUid)
        }
    }

    createActivityListener = (challengeUid) => {
        console.log(`Created activity listener with challengeUid: ${challengeUid}`);
        if (this.activityListener) {
            this.activityListener();
        }
    
        let allDBRefs = Util.getChallengeDependentRefs(challengeUid);
        const dbActivitiesRef = allDBRefs.dbActivitiesRef;

        // try not to do any sorting or filtering to make it fast
        let ref = dbActivitiesRef
            .orderBy("activityDateTime", "desc");
        this.activityListener = ref.onSnapshot((querySnapshot) => {
            let activity = {};
            querySnapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    this.props.addActivity(activity);
                }
                if (change.type === "modified") {
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    this.props.modifyActivity(activity);
                }
                if (change.type === "removed") {
                    // console.log(`Removed Activity: ${change.doc.id}`);
                    activity = change.doc.data();
                    activity.id = change.doc.id;
                    activity.activityDateTime = activity.activityDateTime.toDate();
                    this.props.deleteActivity(activity.id);
                }
            });
        }, (err) => {
            console.error(`Error attaching listener: ${err}`);
        });
    }

    render() {
        return <div></div>;
    }
}
  
const mapDispatchToProps = (dispatch) => {
    return {
        addActivity: (activity) => dispatch(addActivity(activity)),
        deleteActivity: (id) => dispatch(deleteActivity(id)),
        modifyActivity: (activity) => dispatch(modifyActivity(activity)),
    }
}

export default connect(null, mapDispatchToProps)(ActivityListener);