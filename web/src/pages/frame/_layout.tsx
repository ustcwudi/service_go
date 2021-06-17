import React, { useState, useEffect, useMemo, useContext } from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Box from '@material-ui/core/Box';
import MuiAlert from '@material-ui/lab/Alert';
import context from '@/context'
import cloud from '@/util/cloud'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#eee' },
  },
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      width: 350,
      position: 'relative',
      top: '50%',
      marginTop: '-350px',
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }),
);

export default (props: any) => {
  // 云效果
  useEffect(() => {
    cloud()
    return function () {
      cloud()
    }
  }, [])

  const classes = useStyles();
  // 提示框
  const [alert, setAlert] = useState<{ type: "info" | "success" | "error" | "warning", message: string } | undefined>(undefined);
  return <ThemeProvider theme={theme}>
    <Box className={classes.box}>
      <context.Provider value={{
        title: '',
        alert: setAlert
      }}>{props.children}</context.Provider>
    </Box>
    <Snackbar open={alert != undefined} autoHideDuration={3000} transitionDuration={0} onClose={(event, reason) => { if (reason !== 'clickaway') setAlert(undefined) }}>
      <MuiAlert elevation={6} onClose={() => setAlert(undefined)} severity={alert?.type} variant="filled">
        {alert?.message}
      </MuiAlert>
    </Snackbar>
  </ThemeProvider>;
};
