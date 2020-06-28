import React from 'react';
import Box from '@material-ui/core/Box';
import { Card, CardContent, Tooltip } from '@material-ui/core';
import LaunchIcon from '@material-ui/icons/Launch';
import YahooQuotes from '../../Stocks/YahooQuotes';

const StockWidget = (props:any) => {

    const handleClickThermostats = () => {
        // setOpenThermostats(true)
    }
    
    return (
        <Card style={{ height: '100%' }}>
            <CardContent>
                <Box className="row" fontStyle="oblique" fontWeight="fontWeightBold">
                    <Tooltip title="Show All Thermostats">
                        <span onClick={handleClickThermostats}>
                                Watch List
                        </span>
                    </Tooltip>
                    <div style={{ float: 'right' }}>
                        <Tooltip title="Show All Thermostats">
                            <div onClick={handleClickThermostats}>
                                <LaunchIcon />
                            </div>
                        </Tooltip>
                    </div>
                    <div>
                        <YahooQuotes />
                    </div>
                </Box>   
            </CardContent>
        </Card> 
    )
}

export default StockWidget