import React from 'react';
import UserForm from "./UserForm";
  
class UserPage extends React.Component {

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
        <UserForm 
          id={id}
        />
      </div>
    );
  }
}

export default UserPage;