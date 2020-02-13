import React from 'react';
import ActivityForm from "./ActivityForm";
  
class ActivityPage extends React.Component {

  render() {
    // deconstrcut prop from authContext
    let id = null;
    if (this.props.location.state) {
      id =  this.props.location.state.id;
    }

    // // Some props take time to get ready so return null when uid not avaialble
    // if (id === null) {
    //   return null;
    // }

    return ( 
      <div>
        <ActivityForm 
          id={id}
        />
      </div>
    );
  }
}

export default ActivityPage;