function openCreate(){
  document.getElementById("createModal").style.display = "flex";
}

async function createSet(){

  const title = document.getElementById("newTitle").value;
  const color = document.getElementById("newColor").value;

  if(!title){
    alert("Enter a title");
    return;
  }

  await fetch("/sets/create",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      title,
      color
    })
  });

  location.reload();
}

async function editSet(id){

  const newTitle = prompt("New title:");
  const newColor = prompt("New color hex (#ff0000):");

  if(!newTitle && !newColor) return;

  await fetch("/sets/edit",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      id,
      title:newTitle,
      color:newColor
    })
  });

  location.reload();
}

async function deleteSet(id){

  const confirmDelete = confirm("Are you sure you want to delete this set?");
  if(!confirmDelete) return;

  const res = await fetch("/sets/delete",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({ id })
  });

  const data = await res.json();

  if(data.success){
    location.reload();
  }else{
    alert("Delete failed");
  }
}