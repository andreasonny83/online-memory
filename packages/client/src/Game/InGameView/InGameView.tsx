import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useMutation } from '@apollo/react-hooks';
import {
  Grid,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { UserData, useAppState } from '../../AppState';
import { START_GAME } from '../../graphql';
import { useStyles } from './styles';
import { GameData } from '../types';
import { Dashboard } from '../Dashboard';
import { Board } from '../Board';
import { GameHost } from './GameHost';

interface Props {
  user: UserData;
  gameData: GameData;
  loading: boolean;
  onPlayTurn: () => void;
  onCheckOutTile: (tileId: string) => void;
}

export const InGameView: React.FC<Props> = memo(({ user, gameData, loading, onPlayTurn, onCheckOutTile }) => {
  const {
    name,
    players,
    users,
    playerTurn,
    board,
    tiles,
    template,
    moves,
    owner,
    status,
    updatedAt,
    startedAt,
  } = gameData;
  const classes = useStyles();
  const { showMessage } = useAppState();
  const [deltaGameCreation, setDeltaGameCreation] = useState(0);
  const [deltaGameUpdated, setDeltaGameUpdated] = useState(0);

  const userPlayer = players.find(player => player.userId === user.id);
  const gameUpdated = new Date(new Date(updatedAt).toUTCString()).valueOf();
  const gameCreated = new Date(new Date(startedAt).toUTCString()).valueOf();
  const now = new Date(new Date(Date.now()).toUTCString()).valueOf();

  useEffect(() => {
    if (status !== 'started') {
      return;
    }

    const timer1 = setTimeout(() => {
      const deltaCreation = Math.abs(now - gameCreated) / 1000;
      const deltaUpdated = Math.abs(now - gameUpdated) / 1000;

      setDeltaGameCreation(deltaCreation);
      setDeltaGameUpdated(deltaUpdated);
    }, 1000);

    return () => {
      clearTimeout(timer1);
    };
  });

  const [startGame, { loading: startGameLoading }] = useMutation(START_GAME, {
    onError: err => {
      console.warn(err);
    },
  });

  const handleStartGame = useCallback(() => {
    startGame({
      variables: {
        startGameInput: {
          gameId: gameData.id,
        },
      },
    });
  }, [gameData.id, startGame]);

  const open = useMemo(() => {
    return status === 'started' && playerTurn && playerTurn.userId === user.id && playerTurn.status === 'idle';
  }, [playerTurn, status, user.id]);

  const playerTurnOpen = useMemo(() => {
    return status === 'started' && playerTurn && playerTurn.userId !== user.id && playerTurn.status !== 'idle';
  }, [playerTurn, status, user.id]);

  const pad = useCallback((num: number) => {
    return ('0' + num).slice(-2);
  }, []);

  const getGameCreationTime = useCallback(() => {
    const deltaHours = Math.floor(deltaGameCreation / 60 / 60);
    const deltaMinutes = Math.floor(deltaGameCreation / 60) % 60;
    const deltaSeconds = Math.floor(deltaGameCreation - deltaMinutes * 60);

    return `${pad(deltaHours)}:${pad(deltaMinutes)}:${pad(deltaSeconds)}`;
  }, [deltaGameCreation, pad]);

  const getTurnTimer = useCallback(() => {
    const deltaHours = Math.floor(deltaGameUpdated / 60 / 60);
    const deltaMinutes = Math.floor(deltaGameUpdated / 60) % 60;
    const deltaSeconds = Math.floor(deltaGameUpdated - deltaMinutes * 60);

    return `${pad(deltaHours)}:${pad(deltaMinutes)}:${pad(deltaSeconds)}`;
  }, [deltaGameUpdated, pad]);

  const handleBoardClick = useCallback(() => {
    if (playerTurn && playerTurn.status === 'idle' && playerTurn.userId === user.id) {
      onPlayTurn();
    }
  }, [onPlayTurn, playerTurn, user.id]);

  const handleCheckOutTile = useCallback(
    (tileId: number) => {
      if (loading) {
        return;
      }

      if (playerTurn && playerTurn.status === 'idle' && playerTurn.userId === user.id) {
        return;
      }

      onCheckOutTile(`${tileId}`);
    },
    [loading, onCheckOutTile, playerTurn, user.id]
  );

  const handleCopyInvitation = useCallback(() => {
    const invitation = `Come play memory with me!

Join the Online Memory game at:
https://master.d3czed5ma25sw0.amplifyapp.com/game/${gameData.id}

Game ID: ${gameData.id}`;
    (navigator as any).clipboard.writeText(invitation);
    showMessage('Game invitation copied to the clipboard', 'success');
  }, [gameData.id, showMessage]);

  const handleCopyId = useCallback(() => {
    (navigator as any).clipboard.writeText(gameData.id);
    showMessage('Game Id copied to the clipboard', 'success');
  }, [gameData.id, showMessage]);

  const userPlaying =
    playerTurn && users.find(user => playerTurn.status !== 'idle' && user.id === playerTurn.userId)?.item;

  return (
    <div className={`Game ${classes.gameContainer}`}>
      <Snackbar open={open} className={classes.turnAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="info" color="info" elevation={8} variant="standard">
          It's your turn! Make your move
        </Alert>
      </Snackbar>

      {userPlaying && (
        <Snackbar
          open={playerTurnOpen}
          classes={{ anchorOriginBottomLeft: classes.playerTurnOpen }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert severity="info">{userPlaying.displayName} is playing</Alert>
        </Snackbar>
      )}

      <Dialog
        open={Boolean(status === 'idle' && userPlayer && userPlayer.status === 'offline')}
        aria-labelledby="alert-start-game-dialog-title"
        aria-describedby="alert-start-game-dialog-description"
      >
        <DialogTitle id="alert-start-game-dialog-title">Are you ready?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-start-game-dialog-description">
            This game is ready to begin.
            <br /> Click "Let's go" when you're ready start playing
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStartGame} color="primary">
            Let's Go!
          </Button>
        </DialogActions>
      </Dialog>

      <Dashboard
        name={name}
        gameCreationTime={status === 'started' ? getGameCreationTime() : undefined}
        turnTimer={status === 'started' ? getTurnTimer() : undefined}
        moves={status === 'started' ? moves : undefined}
        players={players}
        users={users}
        playerTurn={playerTurn}
      />

      {status === 'new' && owner === user.id ? (
        <Grid
          className={`GameBoard ${classes.boardContainer}`}
          justify="center"
          alignItems="center"
          direction="column"
          spacing={10}
          item
          container
        >
          <GameHost gameId={gameData.id} handleStartGame={handleStartGame} disabled={startGameLoading} />
        </Grid>
      ) : null}

      {status === 'new' && owner !== user.id ? (
        <Grid
          className={`GameBoard ${classes.boardContainer}`}
          justify="center"
          alignItems="center"
          direction="column"
          spacing={10}
          item
          container
        >
          <Typography component="h4" variant="h6" align="center">
            Waiting for the host to start the game
          </Typography>
          <Grid item justify="center" alignItems="center" direction="column" container>
            <Typography variant="subtitle1" align="center" gutterBottom>
              Invite other users to this game sharing this game id: <strong>{gameData.id}</strong>
            </Typography>
            <Grid item container justify="space-evenly">
              <Button variant="outlined" color="default" onClick={handleCopyInvitation}>
                Copy Invitation
              </Button>

              <Button variant="outlined" color="default" onClick={handleCopyId}>
                Copy Game ID
              </Button>
            </Grid>
          </Grid>

          <Grid item>
            <CircularProgress size={60} />
          </Grid>
        </Grid>
      ) : null}

      {status === 'idle' ? (
        <Grid
          className={`GameBoard ${classes.boardContainer}`}
          justify="center"
          alignItems="center"
          direction="column"
          spacing={4}
          item
          container
        >
          <Grid item>
            <Typography component="h4" variant="h6" align="center" gutterBottom>
              Waiting for all the players to be ready
            </Typography>
          </Grid>
          <Grid item>
            <Typography align="center" paragraph>
              Be prepared! This game is about to start
            </Typography>
          </Grid>
        </Grid>
      ) : null}

      {playerTurn && status !== 'idle' && status !== 'new' ? (
        <div onClick={handleBoardClick} className={`GameBoard ${classes.boardContainer}`}>
          <Board
            board={board}
            template={template}
            tiles={tiles}
            loading={loading || startGameLoading}
            disabled={loading || startGameLoading || playerTurn.userId !== user.id}
            startTurn={playerTurn.userId === user.id && playerTurn.status === 'idle'}
            onCheckoutTile={handleCheckOutTile}
            isStarted={gameData.status === 'started' && gameData.moves > 0}
            isEnded={gameData.status === 'ended'}
          />
        </div>
      ) : null}
    </div>
  );
});
