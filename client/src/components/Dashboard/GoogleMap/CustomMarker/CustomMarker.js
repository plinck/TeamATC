import React from "react";
import { Avatar, Card, CardContent, Typography } from "@material-ui/core";

export default function CustomMarker({ name, photo, $hover, label }) {
  let initials = name.match(/\b\w/g) || [];
  initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  const style = {};

  return (
    <div>
      {$hover ? (
        <Card
          style={{
            background: "white",
            width: "150px",
            top: "-125px",
            right: "-75px",
            position: "absolute",
            zIndex: "500",
          }}
        >
          <CardContent style={{ padding: "3px" }}>
            <Typography
              variant="h5"
              style={{ fontSize: "18px", overflow: "hidden" }}
            >
              {name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              Dist: {label.distance} miles
            </Typography>
            <Typography
              margin
              variant="body2"
              color="textSecondary"
              component="p"
            >
              {label.complete}% complete
            </Typography>
          </CardContent>
        </Card>
      ) : null}
      <Avatar
        style={{
          left: "-23px",
          top: "-51px",
          border: "3px solid #ff0100",
          zIndex: "200",
        }}
        src={photo ? photo : null}
      >{photo ? null : initials}</Avatar>
      <div
        style={{
          position: "absolute",
          zIndex: "199",
          bottom: "-1px",
          left: "-10px",
          borderWidth: "10px 10px 0px",
          borderStyle: "solid",
          borderColor: "#ff0100 transparent",
          display: "block",
          width: "0px",
        }}
      />
    </div>
  );
}
