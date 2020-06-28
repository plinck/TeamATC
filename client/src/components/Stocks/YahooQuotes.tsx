import React, { useState, useEffect } from "react";
import { Grid, WithStyles, createStyles, Theme, withStyles, Typography, Button} from '@material-ui/core';
import { StyleRules } from "@material-ui/core/styles";
import axios from "axios";
import Firebase from '../Auth/Firebase/Firebase';
import { withContext } from "../Auth/Session/Context";

const styles: (theme: Theme) => StyleRules<string> = theme =>
  createStyles({
        root: {
            flexGrow: 1,
            padding: theme.spacing(0),
            margin: "0",
            textAlign: 'center',
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            width:350,
            backgroundColor: "f2f2f2"
        },
        grid: {
            padding: theme.spacing(0),
            textAlign: 'center',
            justifyContent: "center",
            justifyItems: "center",
            margin: "0",
            backgroundColor: "transparent",
            maxWidth:"100%",
            flexBasis:"100%"
        },
        gridItem: {
            padding: theme.spacing(0),
            justifyContent: "center",
            justifyItems: "center",
            margin: "0"
        },
        text: {
            marginBottom: "-10px"
        },
        noWrap: {
            whiteSpace: "nowrap",
            overflow: 'hidden',
            [theme.breakpoints.down('sm')]: {
                marginRight: "1px"
            }
        },
        caption: {
            fontStyle: "italic"
        },
        mobile: {
            [theme.breakpoints.down('sm')]: {
                display: "none"
            }
        }
    });

    
class Quote {
    symbolName: string;
    price: number;
    change: number;
    
    constructor() {
        this.symbolName = "";
        this.price = 0;
        this.change = 0;
    }
}

type Props = WithStyles<typeof styles>;

    const YahooQuotes: React.FC<Props> = (props: any) => {
        const {classes} = props;

        // State
        const [symbolQuotes, setSymbolQuotes] = useState(Array<Quote>());

        const testFunctions = ((symbols: string) => {
        const firebase = new Firebase();
        
        //     const testFunctions = firebase.functions.httpsCallable('testFunctions'); 
        //     testFunctions({"uid": "paul"}).then(function(res) {
        //         // Read result of the Cloud Function.
        //         var messageSentBack = res.data.message;
        //         console.log(`return message from cloud function: ${messageSentBack}`)
        //         // ...
        //     });
        
        if (symbols && symbols !== "") {
            const request = {"symbols": symbols};        
            const getStocks = firebase.functions.httpsCallable('getStocks');
            getStocks(request).then((res:any) => {
                // Read result of the Cloud Function.
                console.log(`Stock res: ${res}`);
                let quotes: Array<Quote> = Array<Quote>();
                let responses: any = res.data;
    
                quotes = responses.map((data: any) => {
                    const myQuote: Quote = new Quote();
    
                    myQuote.symbolName = data.symbolName;
                    myQuote.price = data.price;
                    myQuote.change = data.change;
    
                    return myQuote;
                });
                setSymbolQuotes(quotes);
    
            }).catch((err: Error) => {
                console.error(`${err}`);
            });
        } else {
            console.error(`No symbols Found`);
        }
    });

    useEffect(() => {
        let URIRequest = "https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/AAPL,MSFT";
        
        axios.get(URIRequest,
            { headers: { 
                "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
                "x-rapidapi-key": `${process.env.REACT_APP_RAPIDYAHAOO_API_KEY}`
            } 
        }).then((res) => {
            // console.log(`Success retrieving data: ${JSON.stringify(res.data)}`);

            let quotes: Array<Quote> = Array<Quote>();
            let responses: any = res.data;

            quotes = responses.map((data: any) => {
                const myQuote: Quote = new Quote();

                myQuote.symbolName = data.symbol;
                myQuote.price = data.regularMarketPrice;
                myQuote.change = data.regularMarketChange;

                return myQuote;
            });
            setSymbolQuotes(quotes);
            // console.log(quotes);

        }).catch((err: Error) => {
            console.error(err);
        });
    }, []);

    return (
        <Grid container className={classes.root} justify="center">
            <Button 
                onClick={() => { testFunctions("AAPL") }}
                variant="contained"
                color="primary"
                className={classes.button}>
                Get Quotes
            </Button>

            <Grid className={classes.grid} container item xs={12} spacing={3}>
                <Grid className={classes.gridItem} container item xs={4} spacing={0} >
                    Ticker
                </Grid>
                <Grid className={classes.gridItem} container item xs={3} spacing={0}>
                    Price
                </Grid>
                <Grid className={classes.gridItem} container item xs={3} spacing={0}>
                    Change
                </Grid>
            </Grid>
            {symbolQuotes.map((quote, index) => {
                return (
                    <Grid key={index} className={classes.grid} container item xs={12} spacing={3}>
                        <Grid className={classes.noWrap} container item xs sm={4}>
                            <Typography className={classes.text}>
                                {quote.symbolName}
                            </Typography>
                        </Grid>
                        <Grid className={classes.mobile} container item xs={true} sm={3}>
                            <Typography className={classes.text}>
                                {quote.price.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </Typography>
                        </Grid>
                        <Grid className={classes.mobile} container item xs={true} sm={3}>
                            <Typography className={classes.text}>
                                {quote.change.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            })}
        </Grid>
    )
}

export default withContext(withStyles(styles)(YahooQuotes)) as React.ComponentType;