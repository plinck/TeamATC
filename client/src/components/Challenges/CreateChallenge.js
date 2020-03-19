import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Chip, Input, FormHelperText, Button, CardActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';


const useStyles = makeStyles(theme => ({
    fullWidth: {
        margin: `${theme.spacing(1)}px 0px`,
        width: "100%",
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
    formControl: {
        [theme.breakpoints.up('md')]: {
            width: 'calc(50% - 16px)',
            margin: theme.spacing(1),
        },
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            margin: `${theme.spacing(1)}px 0px`,
        },
    }
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


const CreateChallenge = (props) => {
    const classes = useStyles();

    const events = ["Swim", "Bike", "Run"]
    const [selectedEvents, setSelectedEvents] = useState([]);
    const handleChange = event => {
        setSelectedEvents(event.target.value);
    };

    const [scoring, setScoring] = React.useState('');
    const handleScoringChange = event => {
        setScoring(event.target.value);
    };

    const [selectedDate, setSelectedDate] = React.useState(new Date('2020-08-18T21:11:54'));
    const handleDateChange = date => {
        setSelectedDate(date);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Create a New Challenge</Typography>
                <form noValidate autoComplete="off">
                    <TextField
                        className={classes.fullWidth}
                        id="challenge-name"
                        label="Challenge Name"
                        variant="outlined"
                        inputProps={{
                            style: { padding: '18px' }
                        }} />
                    <TextField
                        className={classes.fullWidth}
                        id="challenge-description"
                        label="Description"
                        variant="outlined"
                        multiline
                        placeholder="Tell your competitors about the challenge."
                        inputProps={{
                            style: { padding: '18px' }
                        }} />

                    <FormControl className={classes.formControl}>
                        <InputLabel id="select-events-label">Select Events</InputLabel>
                        <Select
                            labelId="select-events-label"
                            id="select-events"
                            multiple
                            value={selectedEvents}
                            onChange={handleChange}
                            input={<Input id="select-events" />}
                            renderValue={selected => (
                                <div className={classes.chips}>
                                    {selected.map(value => (
                                        <Chip key={value} label={value} className={classes.chip} />
                                    ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                        >
                            {events.map(event => (
                                <MenuItem key={event} value={event}>
                                    {event}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel id="scoring-label">Scoring Metric</InputLabel>
                        <Select
                            labelId="scoring-label"
                            id="scoring-select"
                            value={scoring}
                            onChange={handleScoringChange}
                            label="Scoring Metric"
                        >
                            <MenuItem value='Points'>Points</MenuItem>
                            <MenuItem value='Distance'>Distance</MenuItem>
                            <MenuItem value='Duration'>Duration</MenuItem>
                        </Select>
                    </FormControl>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            className={classes.formControl}
                            margin="normal"
                            id="date-picker-dialog"
                            label="Select a Challenge End Date"
                            format="MM/dd/yyyy"
                            value={selectedDate}
                            onChange={handleDateChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                        />
                    </MuiPickersUtilsProvider>
                </form>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" type="submit">Submit</Button>
            </CardActions>
        </Card>
    )
}

export default CreateChallenge;