import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#000',
            main: '#ff0000',
            dark: '#000',
            contrastText: "#ffffff"

        },
        secondary: {
            main: '#000',
        },
    }
})

export default theme;