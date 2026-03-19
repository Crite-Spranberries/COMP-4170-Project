function openCreate(){
  document.getElementById("createModal").style.display = "flex";
}

async function createSet(){

  const title = document.getElementById("newTitle").value.trim();
  const color = document.getElementById("newColor").value;

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

async function deleteSet(id){

  const confirmDelete = confirm("Are you sure you want to delete this deck?");
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