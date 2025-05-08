document.addEventListener("DOMContentLoaded", getLeaderBoardData());

function getLeaderBoardData() {
  fetch("http://localhost:8080/users/ranking?n=5", {
    method: "GET",
    header: {
      "Access-Control-Allow-Origin": "*",
    },
  })
    .then((response) => response.json())
    .then((res) => mapUsersToLeaderBoard(res));
}

function mapUsersToLeaderBoard(users) {
  console.log(users);
  let holder = document.getElementsByClassName("lboard_wrap")[0];
  let user_name;
  let user_score;

  for (let i = 0; i < 5; i++) {
    user_name = users.data[i].username;
    console.log(user_name)
    user_score = users.data[i].score;
    user_profile_picture = users.data[i].photo_path;
    document.getElementById('rankingButton').addEventListener(
      "click",
      (function (user_name, user_score,user_profile_picture) {
        return function () {
          let contentStringAllMarkers = [
            '<div class="lboard_item today" style="display: block">',
            '<div class="lboard_mem">',
            '  <div class="img">',
            " </div>",
            '<div class="name_bar">',
            '<p><span>' + (i+1) + '.</span> ' + user_name + '</p>',
            ' <!-- <div class="bar_wrap">',
            '<div class="inner_bar" style="width: 95%"></div>',
            " </div> -->",
            " </div>",
            ' <div class="points">' + user_score + " points</div>",
            " </div>",
            " </div>",
          ].join("");

          holder.insertAdjacentHTML( 'beforeend', contentStringAllMarkers );
          

        return contentStringAllMarkers
        };
      })(user_name, user_score,user_profile_picture)
      
    );    
  
  }
  document.getElementById('rankingButton').click()
  
}

function standby() {
  document.getElementById('image').src = './default_pfp.jpg';
}