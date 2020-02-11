import React from 'react';
import Plot from 'react-plotly.js';
import styles from './Savings.module.css';


const Savings = (props) => {

    const cash = props.credit/.975;

    const oldCost = cash * .15;
    const ourCost = cash - props.credit;
    const savings = oldCost - ourCost
    const averageSavings = 1000;

    // Filling bar graph dynamically here. 
    const savingsSection = savings > averageSavings ? averageSavings/ averageSavings : savings / averageSavings;
    const emptySection = 1 - savingsSection;
    let color;

    if (savingsSection < .25){
        color = "rgba(242, 192, 31, 1)"
    } else if (savingsSection > .25 && savingsSection < .50){
        color = "rgba(234, 233, 16, 1)"
    } else {
        color = "green"
    }


    return (
        <div>
            <div className="col s12 l4">
                <div className="card">
                    <div className="card-content pCard savingsCard">
                        <span className="card-title">Savings This Month</span>
                        <div className={`${styles.wrapper}`}>
                            <div className="plotly">
                                <Plot
                                    data={[
                                        {
                                            // Sort: False ensures that the chart does not order descending.  
                                            sort: false,
                                            values: [50, (emptySection * 100) / 2, (savingsSection * 100) / 2],
                                            rotation: 90,
                                            text: ['', '', ``],
                                            textinfo: 'text',
                                            textposition: 'inside',
                                            textfont: {
                                                size: 18,
                                                color: 'white'
                                            },
                                            marker: {
                                                colors: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', color],
                                                line: {
                                                    color: ['rgba(255, 255, 255, 0)', 'rgb(220, 220, 220, 0)', 'rgba(220, 220, 220, 1)'],
                                                    width: 1
                                                },
                                            },
                                            hole: .5,
                                            type: 'pie',
                                            showlegend: false,

                                        }
                                    ]}
                                    layout={
                                        {
                                            autosize: true,
                                            hovermode: false,
                                            xaxis: {
                                                zeroline: false, showticklabels: false,
                                                showgrid: false, range: [-1, 1]
                                            },
                                            yaxis: {
                                                zeroline: false, showticklabels: false,
                                                showgrid: false, range: [-1, 1]
                                            },
                                            paper_bgcolor: 'rgba(0,0,0,0)',
                                            plot_bgcolor: 'rgba(0,0,0,0)',
                                            margin: {
                                                l: 5,
                                                r: 5,
                                                b: 0,
                                                t: 0,
                                            }
                                        }
                                    }
                                    useResizeHandler={true}
                                    style={{ width: "100%", height: "200px" }}
                                    config={{ displayModeBar: false }}
                                />
                                <h5 className={`center-align ${styles.overlay}`}>{`$${savings.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</h5>
                                {/* <p className={`${styles.max}`}>{`$${averageSavings.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Savings;