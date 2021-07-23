import React, { Component } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Link } from "react-router-dom";
import { GiWeight, GiSheep } from "react-icons/gi";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { FaShapes } from "react-icons/fa";

import axios from "axios";
class HomeCaroussel extends Component {
  constructor() {
    super();
    this.state = {
      especes: [],
    };
  }

  async componentDidMount() {
    await axios
      .get(
        "http://127.0.0.1:8000/api/Espece?statut=disponible&order_by=espece&order_mode=asc",
        {
          headers: {
            // "x-access-token": token, // the token is a variable which holds the token
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        this.setState({
          especes: res.data,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    let annonces = {};
    let l = 0;
    try {
      l = this.state.especes.length;
      if (l > 0) {
        annonces = {
          0: this.state.especes[0],
          1: this.state.especes[1],
          2: this.state.especes[2],
          3: this.state.especes[3],
          4: this.state.especes[4],
          5: this.state.especes[5],
          6: this.state.especes[6],
          7: this.state.especes[7],
          8: this.state.especes[8],
          9: this.state.especes[9],
        };
      }
    } catch (error) {
      console.log(error);
    }
    const responsive = {
      desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 5,
        slidesToSlide: 5, // optional, default to 1.
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
        slidesToSlide: 2, // optional, default to 1.
      },
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1, // optional, default to 1.
      },
    };
    return (
      <div style={{ marginBottom: "1rem" }}>
        {l > 0 ? (
          <Carousel
            responsive={responsive}
            swipeable={false}
            draggable={false}
            showDots={true}
            ssr={true} // means to render carousel on server-side.
            infinite={true}
            autoPlay={this.props.deviceType !== "mobile" ? true : false}
            autoPlaySpeed={10000}
            keyBoardControl={true}
            customTransition="all .5"
            transitionDuration={500}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            deviceType={this.props.deviceType}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
          >
            {Object.values(annonces).map((Annonces) => (
              <div
                id="anonce"
                className="product__item"
                style={{
                  margin: "0 10px 0 10px",
                }}
              >
                {Annonces ? (
                  <>
                    <div>
                      <img
                        src={Annonces.image_face}
                        style={{
                          borderRadius: "30%",
                          height: "100px",
                          width: "100%",
                        }}
                      />
                    </div>
                    <div
                      className="product__item__text p-2 text-justify"
                      style={{ margin: "auto" }}
                    >
                      <h6>
                        <GiSheep className=" mr-1 fa-lg " />
                        {Annonces.espece}
                      </h6>
                      <h5 id="mad">{Annonces.prix + " Dhs"}</h5>
                    </div>{" "}
                  </>
                ) : (
                  <></>
                )}
              </div>
            ))}
          </Carousel>
        ) : (
          <div></div>
        )}
      </div>
    );
  }
}

export default HomeCaroussel;
