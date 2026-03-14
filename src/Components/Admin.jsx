import React from 'react'
import { useState } from 'react'

const Admin = () => {
    const [songDetail,setSongDetail]=useState([
        {"title":"","artist":"","mood":""}
    ])

    function handleChange(index,e){
        const updatedSongs=[...songDetail];
        updatedSongs[index][e.target.name]=e.target.value;
        setSongDetail(updatedSongs);
    } 
  return (
    <div>
      <h1>Admin Page</h1>

      <form >
        <label htmlFor="">Song Title:</label>
        <input onChange={()=>{handleChange()}} name="title" className='border-2' type="text" value={songDetail.title} />
        <br />
        <label htmlFor="">Song Artist:</label>
        <input onChange={()=>{handleChange()}} name="artist" className='border-2' type="text" value={songDetail.artist} />
        <br />
        <label htmlFor="">Song Mood:</label>
        <input onChange={()=>{handleChange()}} name="mood" className='border-2' type="text" value={songDetail.mood}/>
        <br />
        <input type="submit" />
      </form>
    </div>
  )
}

export default Admin
