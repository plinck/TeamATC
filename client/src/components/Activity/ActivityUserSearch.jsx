/* eslint-disable no-use-before-define */
import React from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import ActivityDB from "./ActivityDB";

const filter = createFilterOptions();

export default function ActivityUserSearch({
  activities,
  searchForActivities,
}) {
  const filterActivities = () => {
    let names = activities.map((activity) => activity.displayName);
    let filteredNames = [...new Set(names)];
    return filteredNames;
  };

  return (
    <div style={{ width: 300 }}>
      <Autocomplete
        freeSolo
        autoHighlight
        disableClearable
        onChange={(e, val) => searchForActivities(val)}
        options={filterActivities()}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          // Suggest the creation of a new value
          if (params.inputValue !== "") {
            filtered.push(params.inputValue);
          }

          return filtered;
        }}
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
