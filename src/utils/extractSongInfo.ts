export const extractSongInfo = (track: SpotifyApi.PlayHistoryObject) => {
  return {
    id: track.track.id,
    name: track.track.name,
    artists: track.track.artists.map(el => el.name),
    playedAt: track.played_at,
  };
};
