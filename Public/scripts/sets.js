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