import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
  container: {
    margin: theme.spacing(2, 0),
  },
  gameContainer: {
    margin: theme.spacing(6, 0),
  },
  mainContainer: {
    background: 'rgba(3,3,3,.1)',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  scoreCurrentPlayer: {
    color: theme.palette.primary.main,
  },
  loading: {
    marginTop: theme.spacing(20),
    marginBottom: theme.spacing(20),
  },
  snackBarBottomLeft: {
    bottom: '10px',
    left: '10px',
  },
  snackBarTopLeft: {
    top: '80px',
  },
  claimPlayerList: {
    marginTop: theme.spacing(6),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
}));
