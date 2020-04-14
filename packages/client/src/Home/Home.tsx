import React, { useState, useCallback, useRef } from 'react';
import { Link as LinkUI, useHistory } from 'react-router-dom';
import { Container, Typography, Grid, Button, TextField } from '@material-ui/core';
import { useAppState } from '../AppState';
import { useStyles } from './styles';
import logo from '../assets/img/logo.png';

export const Home: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useAppState();
  const inputRef = useRef<HTMLTextAreaElement>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [joinGame, setJoinGame] = useState(false);
  const [joinGameId, setJoinGameId] = useState('');

  const handleJoinGameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setJoinGameId(event.target.value);
  }, []);

  const focusInput = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => inputRef && inputRef.current && inputRef.current.focus(), 0);
  }, []);

  const handleJoinGameToggle = useCallback(async () => {
    setJoinGame(joinGameStatus => !joinGameStatus);

    if (!joinGame) {
      await focusInput();
    }
  }, [focusInput, joinGame]);

  const handleJoinGame = useCallback(() => {
    history.push(`/game/${joinGameId}`);
  }, [history, joinGameId]);

  return (
    <div className="Home">
      <div className={classes.heroContent}>
        <Container maxWidth="sm">
          <Grid container direction="column">
            <Typography component="h1" variant="h2" align="center" color="textPrimary">
              OnLine Memory
            </Typography>
            {user.username && (
              <Typography component="h4" variant="h5" align="center" gutterBottom>
                Welcome back, {user.username}!
              </Typography>
            )}
            <div className={classes.heroButtons}>
              <Grid container spacing={4} justify="center">
                <Grid item>
                  <LinkUI to="/new" className={classes.linkButton}>
                    <Button variant="contained" color="primary">
                      Start new game
                    </Button>
                  </LinkUI>
                </Grid>
                <Grid item>
                  <Button variant="outlined" color="primary" onClick={handleJoinGameToggle}>
                    Join a game
                  </Button>
                </Grid>
              </Grid>
              <Grid container spacing={4}>
                <Grid item></Grid>
              </Grid>
              {joinGame && (
                <Grid container spacing={1} justify="center" alignItems="center">
                  <Grid item xs>
                    <TextField
                      type="text"
                      variant="outlined"
                      inputRef={inputRef}
                      inputProps={{ maxLength: 32 }}
                      value={joinGameId}
                      label="Game ID"
                      onChange={handleJoinGameChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item>
                    <Button variant="outlined" color="primary" onClick={handleJoinGame}>
                      Join
                    </Button>
                  </Grid>
                </Grid>
              )}
            </div>
          </Grid>
        </Container>
      </div>

      <Container className={classes.cardGrid} maxWidth="md">
        <Grid container direction="column" alignItems="center" spacing={4}>
          <Grid item>
            <Typography component="h3" variant="h3" align="center" color="textPrimary" gutterBottom>
              Let's play memory!
            </Typography>

            <Typography component="h4" variant="h4" align="center" color="textSecondary" gutterBottom>
              Spread the love, not the virus
            </Typography>
          </Grid>
          <Grid item>
            <img alt="Memory Italia" src={logo} width="100%" className={classes.image} />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};
