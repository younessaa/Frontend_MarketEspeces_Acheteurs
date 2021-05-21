import React, { Component } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import Loader from "react-loader-spinner";
import { HiOutlineBadgeCheck } from 'react-icons/hi';

import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  TwitterIcon,
} from "react-share";

class DetailsMouton extends Component {
  constructor() {
    super();
    // let redirect = false;
    this.state = {
      loading: true,
      Espece: {},
      cooperative: {},
      eleveur: {},
      Favoris: [],
      Panier: [],
      redirect: false,
      image: "",
      isDispo: false,
      isLoged: false,
      isFav: false,
      isInpanier: false,
    };
    this.onClickImageBoucle = this.onClickImageBoucle.bind(this);
    this.onClickImageProfile = this.onClickImageProfile.bind(this);
    this.onClickImageFace = this.onClickImageFace.bind(this);
    this.handleFavoris = this.handleFavoris.bind(this);
    this.handleDeleteFav = this.handleDeleteFav.bind(this);
    this.handlePanier = this.handlePanier.bind(this);
  }

  onClickImageBoucle() {
    this.setState({ image: this.state.Espece.image_boucle });
  }
  onClickImageProfile() {
    this.setState({ image: this.state.Espece.image_profile });
  }
  onClickImageFace() {
    this.setState({ image: this.state.Espece.image_face });
  }

  componentDidMount() {

    // const idm = this.props.location.state.id;
    const idm = this.props.match.params.idMouton;
    const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");

    this.setState({ loading: true }, () => {
      axios
        .get("http://127.0.0.1:8000/api/Espece/" + idm, {
          headers: {
            // "x-access-token": token, // the token is a variable which holds the token
            "Authorization": myToken,
          },
        })
        .then((res) => {
          this.setState({
            Espece: res.data.objet,
            eleveur: res.data.Eleveur[0],
            image: res.data.objet.image_profile,
            loading: false,

          }, () => {
            axios
              .get("http://127.0.0.1:8000/api/cooperative/" + res.data.objet.id_cooperative, {
                headers: {
                  // "x-access-token": token, // the token is a variable which holds the token
                  "Authorization": myToken,
                },
              })
              .then((res) => {
                this.setState({ cooperative: res.data }, () => {

                });
              })
          });
          if (res.data.objet.statut === "disponible") {
            this.setState({ isDispo: true });
          }
          if (token) {
            this.setState({ isLoged: true });
            // this.props.history.push("/login");
          }
          // console.log(res);
        });
    });
    //-------------------favoris&&Panier--------------------------//

    if (!token) {
      // this.props.history.push("/login");
      this.setState(
        {
          Favoris: [],
          Panier: []
        },
        () => this.setState({ isFav: false })
      );
    } else {
      axios
        .get("http://127.0.0.1:8000/api/consommateur/" + token, {
          headers: {
            "Authorization": myToken,
          },
        })
        .then((res) => {
          var pan = res.data.panier;
          var paniers = pan.filter((pan) => pan.id_espece === idm);
          var fav = res.data.favoris;

          var favoris = fav.filter((fav) => fav.id_espece === idm);

          this.setState(
            {
              Panier: paniers,
              Favoris: favoris,

            }, () => {
              if (this.state.Panier.length !== 0) {
                this.setState({ isInpanier: true });
              }
              if (this.state.Favoris.length !== 0) {
                this.setState({ isFav: true });
              }
            }

          );


        });
    }

  }

  handleFavoris(Mid) {
    const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    if (!token) {
      this.props.history.push("/login");
    } else {
      axios
        .put(
          "http://127.0.0.1:8000/api/consommateur/" + token + "/favoris",
          { id_espece: Mid },

          {
            headers: {
              // "Access-Control-Allow-Origin": "*",
              // "Content-Type": "application/json",
              // Accept: "application/json",
              "Authorization": myToken,
            },
          }
        )
        .then(this.setState({ isFav: true }));
      Swal.fire({
        title: "Ajouté avec succès dans vos Favoris",
        icon: "success",
        width: 400,
        heightAuto: false,
        timer: 1500,
        showConfirmButton: false,
        /* confirmButtonColor: "#7fad39",
 
        confirmButtonText: "Ok!",*/
      });

    }
  }

  handlePanier(Mid) {
    const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    if (!token) {
      this.props.history.push("/login");
    } else {
      // console.log(token);
      axios
        .put(
          "http://127.0.0.1:8000/api/consommateur/" + token + "/panier",
          { id_espece: Mid },

          {
            headers: {
              // "Access-Control-Allow-Origin": "*",
              // "Content-Type": "application/json",
              // Accept: "application/json",
              "Authorization": myToken,
            },
          }
        )
        .then(this.setState({ isInpanier: true }));
      Swal.fire({
        title: "Ajouté dans Pannier",
        icon: "success",
        width: 400,
        heightAuto: false,
        timer: 1500,
        showConfirmButton: false,
        /* confirmButtonColor: "#7fad39",

        confirmButtonText: "Ok!",*/
      });
    }
  }

  handleDeleteFav(Mid) {
    // const idm = this.props.location.state.id;
    const idm = this.props.match.params.idMouton;

    const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    if (!token) {
      this.props.history.push("/login");
    } else {
      // console.log(token);
      axios
        .put(
          "http://127.0.0.1:8000/api/consommateur/" + token + "/favoris/" + idm,

          {},
          {
            headers: {
              //"Content-Type": "application/json",

              Authorization: myToken,
            },
          }
        )
        .then(this.setState({ isFav: false }));
      Swal.fire({
        title: "Supprimé avec succès ",
        icon: "success",
        width: 400,
        heightAuto: false,
        timer: 1500,
        showConfirmButton: false,
        /* confirmButtonColor: "#7fad39",
 
        confirmButtonText: "Ok!",*/
      });
    }
  }

  render() {
    var mois = new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre");
    const { loading } = this.state;
    const shareUrl = "http://localhost:3000/DetailsMouton";
    return (
      <div>

        <style>{` .product__details__text ul{ margin-top:35px;} `}</style>
        {loading ? (
          <div
            style={{
              width: "100%",
              height: "100",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <br></br>
            <Loader
              type="Oval"
              color="#7fad39"
              height="80"
              width="80"
            />
          </div>
        ) : (
          <section className="product-details spad">
            <div className="container">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <div className="product__details__pic" >
                    {this.state.Espece.anoc ? <div className="product__details__pic__item mb-1">
                      <img
                        className="product__details__pic__item--large"
                        src={this.state.image}
                        alt=""
                        id="roundB"
                      />
                    </div> : <div className="product__details__pic__item">
                      <img
                        className="product__details__pic__item--large"
                        src={this.state.image}
                        alt=""
                        id="roundB"
                      />
                    </div>}
                    {this.state.Espece.anoc ?
                      <h1 style={{ fontSize: "14px", backgroundColor: "#4CB050", color: "white" }} className=" badge    rounded-0  w-100  ">
                        <HiOutlineBadgeCheck className=" mr-1 fa-lg " />
                        <span>Labélisé ANOC</span>  </h1>
                      :
                      null}
                    <div className="row">
                      <div className="container">
                        <div id="lesImagesM" className="col-lg-12 col-md-12 mb-2">
                          <div className="row"> <img
                            className="col-sm-4" style={{ height: "100px", width: "auto",margin:"auto" }}
                            // data-imgbigurl="Images/1.jpg"
                            src={this.state.Espece.image_boucle}
                            alt=""
                            onClick={this.onClickImageBoucle}
                          />
                            <img
                              className="col-sm-4" style={{ height: "100px", width: "auto",margin:"auto" }}
                              // data-imgbigurl="Images/1.jpg"
                              src={this.state.Espece.image_face}
                              alt=""
                              onClick={this.onClickImageFace}
                            />
                            <img
                              className="col-sm-4" style={{ height: "100px", width: "auto",margin:"auto" }}
                              // data-imgbigurl="Images/1.jpg"
                              src={this.state.Espece.image_profile}
                              alt=""
                              onClick={this.onClickImageProfile}
                            />

                          </div>

                        </div>
                        {this.state.Espece.anoc ?
                          <span className=" text-success ">
                            <HiOutlineBadgeCheck className=" mr-1 fa-lg " /> Le label de l'ANOC est un gage de la qualité du produit. <br></br></span>
                          : null}
                        <br></br>
                        <div >
                          <br></br>

                          <div id="centrer2">
                            {/* Ajouter ici Social Sharing Button */}
                            <h4 id="centrer2">
                              Partager l'annonce avec vos proches sur :
                              </h4>
                            <br></br>
                            <div>
                              <EmailShareButton
                                url={shareUrl + "/" + this.state.Espece._id}
                                subject="Annonce intéressante à voir (Animal à vendre)"
                                body={"Annonce intéressante à voir ( " + this.state.Espece.categorie + " " + this.state.Espece.race + " )"}
                              >
                                <EmailIcon size={36} round />
                              </EmailShareButton>{" "}
                              {/*<FacebookMessengerShareButton
                                    url="https://github.com/nygardk/react-share"
                                    appId="521270401588372"
                                  >
                                    <FacebookMessengerIcon size={36} round />
                                  </FacebookMessengerShareButton> {" "}*/}
                              <FacebookShareButton
                                // url= "https://youtube.com"
                                url={shareUrl + "/" + this.state.Espece._id}
                                quote={"Annonce intéressante à voir ( " + this.state.Espece.categorie + " " + this.state.Espece.race + " )"}
                              >
                                <FacebookIcon size={36} round />
                              </FacebookShareButton>{" "}
                              <WhatsappShareButton
                                // url= "https://youtube.com"
                                url={shareUrl + "/" + this.state.Espece._id}
                                title={"Annonce intéressante à voir ( " + this.state.Espece.categorie + " " + this.state.Espece.race + " )"}
                                separator=": "
                              >
                                <WhatsappIcon size={36} round />
                              </WhatsappShareButton>{" "}
                              <TwitterShareButton
                                url={shareUrl + "/" + this.state.Espece._id}
                                title={"Annonce intéressante à voir ( " + this.state.Espece.categorie + " " + this.state.Espece.race + " )"}
                              >
                                <TwitterIcon size={36} round />
                              </TwitterShareButton>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="product__details__text">
                    <h3 className="col-lg-12 col-md-12  ">
                      <span className="col-lg-11 col-md-11">
                        {" "}
                      Détails annonce espèce{"              "}
                        <h4 className="d-inline">
                          {this.state.isFav ? (
                            <span className="text-left text-danger col-lg-2 col-md-2">
                              {" "}
                              <a
                                id={this.state.Espece._id}
                                onClick={(e) => {
                                  this.handleDeleteFav(e.currentTarget.id);
                                }}
                              >
                                <i className="fa fa-heart "></i>
                              </a>{" "}
                            </span>
                          ) : null}
                          {!this.state.isFav ? (
                            <span className="text-left text-muted col-lg-2 col-md-2">
                              {" "}
                              <a
                                id={this.state.Espece._id}
                                onClick={(e) =>
                                  this.handleFavoris(e.currentTarget.id)
                                }
                              >
                                <i className="fa fa-heart"></i>
                              </a>{" "}
                            </span>
                          ) : null}
                        </h4>
                      </span>
                    </h3>
                    <h3 id="centrer2">

                    </h3>
                    <div id="centrer" className="container col-md-12">
                      <b>{" "}</b>
                      <br></br>
                      <b>Annonce № : <span className="text-secondary">{this.state.Espece.reference}</span> <br></br> </b>
                      <br></br>
                      <b className="w-50">Nom du proprietaire (eleveur) :
                      <span className="text-secondary"> {" " + this.state.eleveur.nom.toUpperCase() +
                          "     " +
                          this.state.eleveur.prenom} </span></b>

                      <ul className="pt-4">

                        <li>
                          <b>№ Boucle</b> <span>{this.state.Espece.boucle}</span>
                        </li>
                        <li>
                          <b>Espece</b> <span>{this.state.Espece.espece}</span>
                        </li>
                        {/*<li>
                          <b>Categorie</b> <span>{this.state.Espece.categorie}</span>
                        </li>*/}
                        <li>
                          <b>Race</b> <span>{this.state.Espece.race}</span>
                        </li>
                        <li>
                          <b>localisation</b> <span>{this.state.Espece.localisation} </span>
                        </li>
                        <li>
                          <b>sexe</b> <span>{this.state.Espece.sexe} </span>
                        </li>
                        <li>
                          <b>Age</b> <span>{this.state.Espece.age} mois</span>
                        </li>
                        <li>
                          <b>Poids</b> <span>{this.state.Espece.poids} Kg</span>
                        </li>



                        <li>

                        </li>

                        <li className="bg-ligh text-danger  h6 center" >
                          <b>Prix </b>
                          {this.state.Espece.prix} Dhs<i> (Hors transport)</i>
                        </li>
                      </ul>
                    </div>
                    <br></br>

                  </div>
                  <div>
                    <h4>Description</h4>
                    <div id="gris" className="container ">
                      {this.state.Espece.description ? (
                        <p className="text-dark col-md-12">{this.state.Espece.description}</p>
                      ) : (
                        <p  >Aucune description disponible</p>
                      )}
                    </div>
                    <br></br>
                
                  
                <br></br>
                <div  className="row  text-center">    
                    {!this.state.isLoged ? this.state.isDispo ?
                         <div className="col-md-6 mt-2">  <Link
                          to={{
                            pathname: "/Commander",
                            state: {
                              id: this.state.Espece._id,
                              cooperative: this.state.cooperative
                            },
                          }}
                        >
                          <button style={{ borderColor: 'transparent', backgroundColor: "#4CB050",paddingLeft:"19px",paddingRight:"19px" }}

                            className="primary-btn rounded     "  >
                             <i className="fa fa-plus"></i> Commander l'espece
        </button>
                        </Link></div>
 

                      : null :
                      this.state.isDispo && !this.state.isInpanier ? <>
                        <div className="col-md-6 mt-2"> 
                        <Link  >
                         <button style={{ borderColor: 'transparent', backgroundColor: "#4CB050" }}
                          id={this.state.Espece._id}
                          className="primary-btn rounded "
                          onClick={(e) =>
                            this.handlePanier(e.currentTarget.id)
                          }
                        >
                          <i className="fa fa-shopping-cart"></i> Ajouter au panier
            </button>  </Link> </div>
                        <div className="col-md-6 mt-2">  <Link
                          to={{
                            pathname: "/Commander",
                            state: {
                              id: this.state.Espece._id,
                              cooperative: this.state.cooperative
                            },
                          }}
                        >
                          <button style={{ borderColor: 'transparent', backgroundColor: "#4CB050",paddingLeft:"19px",paddingRight:"19px" }}

                            className="primary-btn rounded    "  >
                            <i className="fa fa-plus"></i> Commander l'espece
</button>
                        </Link></div>
                      </>

                        : this.state.isDispo && this.state.isInpanier ?
                           
                            <div className="col-md-6 mt-2">  <Link
                              to={{
                                pathname: "/Commander",
                                state: {
                                  id: this.state.Espece._id,
                                  cooperative: this.state.cooperative
                                },
                              }}
                            >
                              <button style={{ borderColor: 'transparent', backgroundColor: "#4CB050" ,paddingLeft:"19px",paddingRight:"19px"}}

                                className="primary-btn rounded    "  >
                                 <i className="fa fa-plus"></i> Commander l'espece
</button>
                            </Link></div>
                            : null}
                     
                </div>
          
                <br></br>
                 </div>
               
             


                 



                    <br></br>
                    
                  </div>
 
              </div>
          </div>
          </section>
        )}
      </div>
    );
  }
}

export default DetailsMouton;
