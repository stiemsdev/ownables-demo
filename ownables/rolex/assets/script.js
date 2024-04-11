function flipImage(index){
    var firstImage = document.getElementById("image");
    var secondImage = document.getElementById("second-image");
    var dots = document.getElementsByClassName("dot");

    if (index === 0) {
      firstImage.classList.remove("flipped");
      secondImage.classList.add("flipped");
      dots[0].classList.add("active");
      dots[1].classList.remove("active");
    } else if (index === 1) {
      firstImage.classList.add("flipped");
      secondImage.classList.remove("flipped");
      dots[0].classList.remove("active");
      dots[1].classList.add("active");
    }
  }
  