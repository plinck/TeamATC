import React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';

const UserWidget = (props) => {
    return (
        <Card style={{ height: "100%" }}>
            <CardContent>
                <Typography variant="h5" style={{ fontStyle: "italic" }}>
                    Team:
                </Typography>
                {props.team}
                <Typography variant="h5" style={{ fontStyle: "italic" }}>
                    Current Challenge:
                </Typography>
                {props.challenge}
            </CardContent>
        </Card>
    )
}

export default UserWidget