import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Firebase from './components/Auth/Firebase/Firebase.js'; // Firebase instance 
import FirebaseContext from "./components/Auth/Firebase/FirebaseContext";
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme/theme';
// To ensure firebase is only instantiated once

// import registerServiceWorker from './registerServiceWorker';
import * as serviceWorker from './serviceWorker';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './reducers/rootReducer'

const store = createStore(rootReducer);

ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
        <MuiThemeProvider theme={theme}>
            <Provider store={store}>
                <App />
            </Provider>
        </MuiThemeProvider>
    </FirebaseContext.Provider>,
    document.getElementById('root')
);
// registerServiceWorker();

serviceWorker.unregister();
