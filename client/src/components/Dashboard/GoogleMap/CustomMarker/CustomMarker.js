import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Avatar, Card, CardContent, Typography } from "@material-ui/core";

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      background: "white",
      width: "150px",
      top: "-115px",
      right: "-75px",
      position: "absolute",
      zIndex: "500",
    },
    avatar: {
      left: "-18px",
      top: "-41px",
      border: "3px solid #ff0100",
      zIndex: "200",
      width: "30px",
      height: "30px"
    },
    carrot: {
      position: "absolute",
      zIndex: "199",
      bottom: "-1px",
      left: "-10px",
      borderWidth: "10px 10px 0px",
      borderStyle: "solid",
      borderColor: "#ff0100 transparent",
      display: "block",
      width: "0px",
    },
  })
);

export default function CustomMarker({ name, photo, $hover, label }) {
  const classes = useStyles();

  let initials = name.match(/\b\w/g) || [];
  initials = ((initials.shift() || "") + (initials.pop() || "")).toUpperCase();

  return (
    <div>
      {$hover ? (
        <Card className={classes.card}>
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
            <Typography variant="body2" color="textSecondary" component="p">
              {label.complete}% complete
            </Typography>
          </CardContent>
        </Card>
      ) : null}
      <Avatar className={classes.avatar} src={photo ? photo : null}>
        {photo ? null : initials}
      </Avatar>
      <div className={classes.carrot} />
    </div>
  );
}
