import React from 'react';
import { Typography, AppBar, Toolbar, Button, Link, Grid, Container, IconButton, Tooltip } from '@material-ui/core';
import Sun from '@material-ui/icons/Brightness7';
import Moon from '@material-ui/icons/Brightness4';
import gitHub from './github.svg';
import { Router } from './router';
import { useAuth } from '../Auth/useAuth';
import { useStyles } from './styles';

interface Props {
  darkTheme: boolean;
  toggleDarkTheme: () => void;
}

export const AppComponent: React.FC<Props> = ({ darkTheme, toggleDarkTheme }) => {
  const classes = useStyles();
  const { logOut } = useAuth();

  return (
    <Grid className={`App ${classes.app}`} direction="column" container>
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" className={classes.title} noWrap>
            <Link href="/" color="inherit">
              OnLine Memory
            </Link>
          </Typography>

          <IconButton aria-label="Toggle light/dark theme" color="inherit" onClick={toggleDarkTheme}>
            <Tooltip title="Toggle light/dark theme" aria-label="Toggle light/dark theme">
              {darkTheme ? <Sun /> : <Moon />}
            </Tooltip>
          </IconButton>
          <Link href="/about" underline="none" color="inherit">
            <Button color="inherit">About</Button>
          </Link>
          <Button color="inherit" onClick={logOut}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <main className={classes.main}>
        <Router />
      </main>
      <footer className={classes.footer}>
        <Container maxWidth="sm">
          <Grid container direction="column" alignItems="center" spacing={4}>
            <Grid item>
              <Typography variant="h6" align="center" gutterBottom></Typography>
              <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
                Copyright &copy;{' '}
                <Link color="inherit" href="https://github.com/andreasonny83/">
                  andreasonny83
                </Link>
                {' ' + new Date().getFullYear()}. Made with <img src="/catButt.png" height={32} alt="cat butt" />
              </Typography>
            </Grid>
            <Grid item>
              <Link color="inherit" href="https://github.com/andreasonny83/online-memory/">
                <img src={gitHub} className={classes.gitHubLogo} height={38} alt="GitHub-logo" />
              </Link>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </Grid>
  );
};
