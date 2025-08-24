import React, { useState } from 'react';

function RoomSelection({ onJoinRoom, username }) {
  const [room, setRoom] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (room.trim()) {
      onJoinRoom({ room, username });
    }
  };

  return (
    <div className="room-selection-container">
      <h2>Select a Room</h2>
      <form onSubmit={handleJoin}>
        <div className="form-group">
          <label htmlFor="room">Room Name</label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="join-room-button">
          Join Room
        </button>
      </form>
    </div>
  );
}

export default RoomSelection;
