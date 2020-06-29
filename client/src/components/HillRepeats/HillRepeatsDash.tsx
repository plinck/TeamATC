import React from 'react';
import { WidthProvider, Responsive } from "react-grid-layout";
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Button, WithStyles, createStyles, Theme, withStyles } from "@material-ui/core";

import { ClassValue } from 'classnames/types';
import { StyleRules } from "@material-ui/core/styles";
import { Container } from '@material-ui/core'
import Util from "../Util/Util";

import { HillRepeat } from "../../interfaces/HillRepeat";
import HillRepeatsTotalsGraph from './HillsRepeatsTotalsGraph/HillRepeatsTotalsGraph';

const globalAny:any = global;

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};

const styles: (theme: Theme) => StyleRules<string> = theme =>
  createStyles({
    root: {
        [theme.breakpoints.up('md')]: {
            marginLeft: "57px",
        },
        paddingTop: "10px",
        backgroundColor: "#f2f2f2"
    },
    bubble: {
        [theme.breakpoints.down('md')]: {
            display: "none"
        },
    },
    card: {
        height: "100%"
    },
    mobile: {
        touchAction: "auto !important"
    }
  });
interface OwnProps {
    style?: ClassValue;
}

interface myState {
    layouts?: ReactGridLayout.Layouts;
    hillRepeats: Array<HillRepeat>;
}

// Exposed to user's of component - not styles
type PublicProps = OwnProps & myState;
type Props = PublicProps & WithStyles<typeof styles> & any;

class HillRepeatsDash extends React.Component<Props> {
    hillRepeatsListener: any;

    state: myState = {
        layouts: JSON.parse(JSON.stringify(originalLayouts)),
        hillRepeats: []
    };

    constructor(props:any) {
        super(props);

        this.state = {
            layouts: JSON.parse(JSON.stringify(originalLayouts)),
            hillRepeats: []
        };
    }

    componentDidMount() {
        let layouts: ReactGridLayout.Layouts = getFromLS("layouts") || {};
        this.setState({ layouts: JSON.parse(JSON.stringify(layouts)) });

        if (this.hillRepeatsListener) {
            this.hillRepeatsListener();
        }

        const dbAllRefs = Util.getBaseDBRefs();
        const dbHillRepeatsRef = dbAllRefs.dbHillRepeatsRef;

        let allRepeats: Array<HillRepeat> = [];
        this.hillRepeatsListener = dbHillRepeatsRef.onSnapshot((querySnapshot) => {
            querySnapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    let newRepeat: HillRepeat = new HillRepeat(change.doc.id);
                    newRepeat = change.doc.data() as HillRepeat;
                    newRepeat.repeatDateTime = change.doc.data().repeatDateTime.toDate();
                    newRepeat.id = change.doc.id;
                    allRepeats.push(newRepeat);
                }
                if (change.type === "modified") {
                    let changedRepeat: HillRepeat = new HillRepeat("");
                    changedRepeat = change.doc.data() as HillRepeat;
                    changedRepeat.repeatDateTime = change.doc.data().repeatDateTime.toDate();
                    changedRepeat.id = change.doc.id;
                    allRepeats = allRepeats.map(repeat => {
                        if (changedRepeat.id === repeat.id) {
                            return changedRepeat;
                        } else {
                            return changedRepeat;
                        }
                    });
                }
                if (change.type === "removed") {
                    // console.log(`Removed Result: ${change.doc.id}`);
                    allRepeats.filter(repeat => {
                        return repeat.id !== change.doc.id;
                    });            
                }
            });
            this.setState({hillRepeats: [...allRepeats]});
        });
    }

    componentWillUnmount() {
        if (this.hillRepeatsListener) {
            this.hillRepeatsListener();
        }
    }

    static get defaultProps() {
        return {
            className: "layout",
            cols: { lg: 12, md: 12, sm: 4, xs: 4, xxs: 2 },
            rowHeight: 50
        };
    }
    onChildChanged() {
        this.setState({ isDraggable: false })
    }

    resetLayout() {
        this.setState({ layouts: {} })
    }

    onLayoutChange(layout: ReactGridLayout.Layout[], layouts: ReactGridLayout.Layouts) {
        saveToLS("layouts", layouts);
        this.setState({ layouts });
    }

    gotoHillRepeatsPage = () => {
        this.props.history.push({
            pathname: '/hillrepeats'
        });
    }
    gotoHillRepeatsDash = () => {
        this.props.history.push({
            pathname: '/hillrepeatsdash'
        });
    }

    
    public render() {
        const { classes } = this.props;
    
        return (
            <div style={{ backgroundColor: "#f2f2f2" }} className={classes.root}>
                <Container maxWidth="xl">
                    {/* <button onClick={() => this.resetLayout()}>Reset Layout</button> */}
                    <Button 
                        onClick={() => this.gotoHillRepeatsPage()}
                        variant="contained"
                        color="primary"
                        className={classes.button}>
                        Enter Repeats
                    </Button>

                    <ResponsiveReactGridLayout
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        className="layout"
                        rowHeight={50}
                        layouts={this.state.layouts}
                        isDraggable={this.props.width <= 600 ? false : true}
                        isResizable={this.props.width <= 600 ? false : true}
                        onLayoutChange={(layout: ReactGridLayout.Layout[], layouts: ReactGridLayout.Layouts) =>
                            this.onLayoutChange(layout, layouts)
                        }
                    >

                        <div key="1" className={this.props.width <= 600 ? classes.mobile : null} data-grid={{ w: 6, h: 8, x: 0, y: 0, minW: 6, minH: 8, maxW: 10 }}>
                            <HillRepeatsTotalsGraph hillRepeats={this.state.hillRepeats} />
                        </div>

                    </ResponsiveReactGridLayout>
                </Container>
            </div>
        ); //return
    } // render()
}

function getFromLS(key: any) {
    let ls:any = {};
    if (globalAny.localStorage) {
        try {
            ls = JSON.parse(globalAny.localStorage.getItem("rgl-8")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key];
}

function saveToLS(key: any, value: any) {
    if (globalAny.localStorage) {
        globalAny.localStorage.setItem(
            "rgl-8",
            JSON.stringify({
                [key]: value
            })
        );
    }
}

export default withStyles(styles)(WidthProvider((HillRepeatsDash)));