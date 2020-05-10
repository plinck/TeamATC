/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import UserDB from "../User/UserDB";
import { useEffect } from "react";

export default function ActivityUserSearch({ searchForActivities }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    UserDB.getUsers().then((res) => {
      setUsers(res);
    });
  }, []);

  const filterActivities = () => {
    let names = users.map((user) => user.displayName);
    let filteredNames = [...new Set(names)];
    return filteredNames;
  };

  return (
    <div style={{ width: 300, margin: "0px 0px 15px 0px" }}>
      <Autocomplete
        autoHighlight
        disableClearable
        onChange={(e, val) => searchForActivities(val)}
        options={filterActivities()}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Users By Name"
            InputProps={{ ...params.InputProps, type: "search" }}
          />
        )}
      />
    </div>
  );
}
