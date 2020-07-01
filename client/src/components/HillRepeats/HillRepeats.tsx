import React, { Component } from 'react'
import {
  Checkbox,
  CircularProgress,
  createStyles,
  Container,
  Fab,
  Grid,
  StyleRules,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core";
import DatePicker from "react-datepicker";

// import Button from "@material-ui/core/Button";
import { Add as AddIcon, Remove as RemoveIcon } from '@material-ui/icons';

import MaterialTable from 'material-table'
import { withContext } from "../Auth/Session/Context";
import { ContextType } from "../../interfaces/Context.Types";

const styles: (theme: Theme) => StyleRules<string> = theme =>
  createStyles({
    hillrepeats: {
      width: "100%",
      overflow: "auto",
      marginLeft: "2%",
      marginRight: "2%",
      [theme.breakpoints.up("md")]: {
        height: "79vh",
      },
      height: "65.5vh",
    },
    root: {
      [theme.breakpoints.up("md")]: {
        marginLeft: "57px",
      },
      paddingTop: "10px",
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
      [theme.breakpoints.down("md")]: {
        display: "none",
      },
      textDecoration: "none",
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
    handlePlusMinusClick = (rowData: any, name: string) => {
        // get the index of the row that changed and copy into new data row
        const idx = rowData.tableData.id;
        const newDataRow = this.state.data[idx];

        // Replace the field that changed within that rpw
        newDataRow.repeats = name === "addrepeat" ? this.state.data[idx].repeats + 1 : this.state.data[idx].repeats - 1;

        // Put the newly changed row in data in place of old row
        const newDataAllRows = this.state.data;
        newDataAllRows.splice(idx, 1, newDataRow);   

        // replace the data field in state
        this.setState({ ...this.state, data: newDataAllRows });

        //  I couldnt figure out an esier way to replace a specific rows', specific field checkbox in a simpler way.
    };    

    handleCheckClick = (rowData: any, name: string) => {
        // get the index of the row that changed and copy into new data row
        const idx = rowData.tableData.id;
        const newDataRow = this.state.data[idx];

        // Replace the field that changed within that rpw
        newDataRow[name] = !this.state.data[idx][name];

        // Put the newly changed row in data in place of old row
        const newDataAllRows = this.state.data;
        newDataAllRows.splice(idx, 1, newDataRow);   

        // replace the data field in state
        this.setState({ ...this.state, data: newDataAllRows });

        //  I couldnt figure out an esier way to replace a specific rows', specific field checkbox in a simpler way.
    };    

    // Handle Date Picker Change
    handleDateChange = (date: Date) => {
        this.setState({
            repeatDateTime: date
        });    
    }
    

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
      
        return(
            <Container className={classes.hillrepeats} maxWidth="xl">
                <label>{`Activity Date: `}
                </label>
                <DatePicker
                    id="repeatDateTime"
                    name="repeatDateTime"
                    value={repeatDateTime.toDateString()}

                    selected={repeatDateTime}
                    onSelect={date => this.handleDateChange(date)} //when day is clicked
                    onChange={date => this.handleDateChange(date)} //only when value has changed

                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy"
                />


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
            </Container>
        )
    }
}

export default withContext(withStyles(styles)(HillRepeats)) as React.ComponentType<PublicProps>;
