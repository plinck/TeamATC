/*tslint:disable:object-literal-shorthand*/
import React, { Component } from 'react'
import {
    Button,
    Checkbox,
    CircularProgress,
    createStyles,
    Container,
    Fab,
    Grid,
    Hidden,
    StyleRules,
    Theme,
    Typography,
    withStyles,
    WithStyles
} from "@material-ui/core";
import DatePicker from "react-datepicker";

// import Button from "@material-ui/core/Button";
import { Add as AddIcon, Remove as RemoveIcon, GetApp as GetAppIcon } from '@material-ui/icons';
import { CSVLink } from "react-csv";

import MaterialTable from 'material-table'
import { withContext } from "../Auth/Session/Context";
import { ContextType } from "../../interfaces/Context.Types";
import Weekdays from "../../interfaces/Weekdays";

import { HillRepeat } from "../../interfaces/HillRepeat";
import { HillRepeatsDB } from "./HillRepeatsDB";

const DEFAULT_ELEVATION_GAIN: number = 110;

const styles: (theme: Theme) => StyleRules<string> = theme =>
  createStyles({
    hillrepeats: {
      width: "99%",
      overflow: "auto",
      marginLeft: "1%",
      marginRight: "1%",
      [theme.breakpoints.up("sm")]: {
        marginLeft: "50px",
        marginRight: "50px"
      },
    },
    root: {
      [theme.breakpoints.up("md")]: {
        marginLeft: "57px",
      },
      paddingTop: "10px",
    },
    reactDatepickerPopper: {
		zIndex: "999!important" as any
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    progress: {
      margin: theme.spacing(2),
    },
    container: {
      display: "flex",
      flexWrap: "wrap",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    inputFix: {
      marginTop: 50,
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
    resize: {
      fontSize: 200,
    },
    csvButton: {
        marginRight: theme.spacing(3),
    },
    fab: {
        margin: theme.spacing(1),
    },    
  });  

  // Just my own custom/extended props
interface OwnProps {
  anything: any
}

// type Column = { title: string, field: string, editable?: string, type?: any, lookup?: any}
// type Data = { name: string; surname: string, birthYear: number, birthCity: number }
type Data = any;
type Column = any;
type Actions = any;
type Options = any;
type MyState = {
    message?: string;
    repeatDateTime: Date;
    columns : Column[];
    data: Data[];
    actions?: Actions[];
    options?: Options
}

interface ContextProps {
  context: ContextType;
}

// Exposed to user's of component - not styles
type PublicProps = OwnProps;

type Props = PublicProps & WithStyles<typeof styles> & ContextProps;


class HillRepeats extends Component<Props, MyState> {
    constructor(props: Props) {
        super(props);
    
        this.state = {
            message: "",
            repeatDateTime: new Date(),
            columns: [],
            data: [
                { checkin: false, checkout: false, displayName: 'Jerome', email: 'jessica@email.com', repeats: 6 },
                { checkin: false, checkout: false, displayName: 'Jessica', email: 'jessica@email.com', repeats: 10 },
            ],
            actions: [
            ],
            options: {
                actionsColumnIndex: -1
            }  
        };
    }    

    fetchHillRepeatsByDate(pRepeatDate: Date) {
        let repeatDate: Date = pRepeatDate;
        const hillRepeatsDB = new HillRepeatsDB();

        if (!repeatDate) {
            repeatDate = new Date();
        }
        hillRepeatsDB.getAll(repeatDate).then((pHillRepeats: any) => {
          const hillRepeats = pHillRepeats as Array<HillRepeat>;
          const data: Data[] = new Array<Data>();
          
          hillRepeats.forEach((repeat: HillRepeat) => {
            data.push({
              id: repeat.id,
              checkin: repeat.checkin,
              checkout: repeat.checkout,
              description: repeat.description,
              displayName: repeat.displayName,
              elevationGainPerRepeat: repeat.elevationGainPerRepeat,
              email: repeat.email ? repeat.email : "",
              repeatDateTime: repeat.repeatDateTime,
              repeats: repeat.repeats,
              uid: repeat.uid
            })
          });
          this.setState({data: data});
        }).catch((err: Error) => {
          console.error(`${err}`);
          this.setState({message: `Error retrieving hill repeats: ${err.message}`});
        });

    }
    componentDidMount() {
       	this.fetchHillRepeatsByDate(this.state.repeatDateTime);
    }

    // Handle Date Picker Change
    handleDateChange = (date: Date) => {
		this.fetchHillRepeatsByDate(date);

		this.setState({
			repeatDateTime: date
		});    
  	}

    handlePlusMinusClick = (rowData: any, name: string) => {
      // get the index of the row that changed and copy into new data row
      const idx = rowData.tableData.id;
      const newDataRow = this.state.data[idx];

      // Replace the field that changed within that row
      newDataRow.repeats = name === "addrepeat" ? this.state.data[idx].repeats + 1 : this.state.data[idx].repeats - 1;
      newDataRow.checkin = true;
      newDataRow.checkout = true;
      
      const hillRepeat: HillRepeat = {...newDataRow};
      hillRepeat.elevationGainPerRepeat = hillRepeat.elevationGainPerRepeat ? hillRepeat.elevationGainPerRepeat : DEFAULT_ELEVATION_GAIN;
      const hillRepeatsDB = new HillRepeatsDB();

      hillRepeatsDB.update(hillRepeat).then(() => {
        // Put the newly changed row in data in place of old row
        const newDataAllRows = this.state.data;
        newDataAllRows.splice(idx, 1, newDataRow);   

        // replace the data field in state
        this.setState({ ...this.state, message: "Updated", data: newDataAllRows });
      }).catch((err: Error) => {
        console.error(`${err}`);
        this.setState({message: `Error updating hill repeats: ${err.message}`});
      });
    };    

    handleCheckClick = (rowData: any, name: string) => {
      // get the index of the row that changed and copy into new data row
      const idx = rowData.tableData.id;
      const newDataRow = this.state.data[idx];
      // Replace the field that changed within that row
      newDataRow[name] = !this.state.data[idx][name];
      
      const hillRepeat: HillRepeat = {...newDataRow};
      hillRepeat.elevationGainPerRepeat = hillRepeat.elevationGainPerRepeat ? hillRepeat.elevationGainPerRepeat : DEFAULT_ELEVATION_GAIN;
      const hillRepeatsDB = new HillRepeatsDB();
      hillRepeatsDB.update(hillRepeat).then(() => {
        // Put the newly changed row in data in place of old row
        const myDataAllRows = this.state.data;
        myDataAllRows.splice(idx, 1, newDataRow);   

        // replace the data field in state
        this.setState({ ...this.state, message: "Updated", data: myDataAllRows });
      }).catch((err: Error) => {
        console.error(`${err}`);
        this.setState({message: `Error updating hill repeats: ${err.message}`});
      });

      // Put the newly changed row in data in place of old row
      const tempDataAllRows = this.state.data;
      tempDataAllRows.splice(idx, 1, newDataRow);   

      // replace the data field in state
      this.setState({ ...this.state, data: tempDataAllRows });

      //  I couldnt figure out an esier way to replace a specific rows', specific field checkbox in a simpler way.
    };        

    render() {    
        if (this.props.context.uid === null) {
          return (
            <Grid container style={{ marginTop: "10px" }} justify="center">
              <CircularProgress /> <p>Loading ...</p>{" "}
            </Grid>
          );
        }
      
        if (!this.state.data || this.state.data === null) {
          console.error("Fatal Error");
          return (
            <div>
              {" "}
              <p>FATAL ERROR Gettng Repeats ...</p>{" "}
            </div>
          );
        }

        const { classes } = this.props;
        const { repeatDateTime } = this.state;
        const weekdays = new Weekdays();
      
        return(
            <Container className={classes.hillrepeats} maxWidth="xl">
                <Grid
                    container
                    xs={12}
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                >
                    <Grid item xs={8}>
                        <Typography variant="h5" gutterBottom component="h2"><br/>Hill Repeats for Day</Typography>
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "right"}}>
						<Hidden smDown>
							<Typography variant="h5" gutterBottom component="h2">
							<CSVLink 
								className={classes.csvButton}
								data={this.state.data}
								filename={"hillrepeats.csv"}
								target="_blank"
								>
								<Button color="default" startIcon={<GetAppIcon />}>
									Export CSV
								</Button>
							</CSVLink>
							</Typography>
						</Hidden>
                    </Grid>
                    <Grid item xs={6}>
                        <div style={{zIndex: 2, position: "relative"}}>
                            <label>{`Date: `}
                            </label>
                            <DatePicker className={classes.reactDatepickerPopper}
                                id="repeatDateTime"
                                name="repeatDateTime"
                                value={repeatDateTime.toDateString()}

                                selected={repeatDateTime}
                                onSelect={date => this.handleDateChange(date)} // when day is clicked
                                onChange={date => this.handleDateChange(date)} // only when value has changed

                                openToDate={new Date()}
                                autoFocus={true}
                                dateFormat="MMMM d, yyyy"                        
                            />
                            <span><em><b> {weekdays.name[repeatDateTime.getDay()]}</b></em></span>
                        </div>
                    </Grid>
                </Grid>
                <br/>
				<div style={{zIndex: 1, position: "relative"}}>
                    <MaterialTable
                        title="Hill Repeats"
                        columns={[
                          {
                            field: 'checkin',
                            title: 'Check In',
                            editable: 'never',
                            render: (rowData: any) => <Checkbox name="checkin" checked={rowData.checkin} onClick={() => this.handleCheckClick(rowData, "checkin")} />
                          },
                          {
                            field: 'checkout',
                            title: 'Check Out',
                            editable: 'never',
                            render: (rowData: any) => <Checkbox name="checkout" checked={rowData.checkout} onClick={() => this.handleCheckClick(rowData, "checkout")} />
                          },
            
                          { title: 'Name', field: 'displayName', editable: 'onUpdate' },
                          { title: 'Email', field: 'email', editable: 'never' },
                          
                          { title: 'Repeats', field: 'repeats', type: 'numeric' },

                          {
                            field: 'addrepeat',
                            title: 'More',
                            editable: 'never',
                            render: (rowData: any) => <Fab onClick={() => this.handlePlusMinusClick(rowData, "addrepeat")} color="primary" aria-label="Add" className={classes.fab}><AddIcon /></Fab>
                    
                          },

                          {
                            field: 'removerepeat',
                            title: 'Less',
                            editable: 'never',
                            render: (rowData: any) => <Fab onClick={() => this.handlePlusMinusClick(rowData, "removerepeat")} color="primary" aria-label="Add" className={classes.fab}><RemoveIcon /></Fab>
                    
                          },

                        ]}
            
                        data={this.state.data}
                        actions={this.state.actions}
                        options={this.state.options}
                        editable={{
                            onRowAdd: newData =>
                                new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    this.setState({ data: [...this.state.data, newData] });
                                    resolve();
                                }, 1000)
                            }),
                            onRowUpdate: (newData, oldData) =>
                                new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    const dataUpdate = [...this.state.data];
                                    const index = oldData.tableData.id;
                                    dataUpdate[index] = newData;
                                    this.setState({ data: [...dataUpdate] });
                                    resolve();
                                }, 1000)
                            }),
                            onRowDelete: oldData =>
                                new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    const dataDelete = [...this.state.data];
                                    const index = oldData.tableData.id;
                                    dataDelete.splice(index, 1);
                                    this.setState({ data: [...dataDelete] });
                                    resolve();
                                }, 1000)
                            }),
                        }}
                    />
				</div>
            </Container>
        )
    }
}

export default withContext(withStyles(styles)(HillRepeats)) as React.ComponentType<PublicProps>;
