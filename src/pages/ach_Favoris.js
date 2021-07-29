import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Pagination from "react-js-pagination";
import "bootstrap-less";
import Loader from "react-loader-spinner";
import Swal from "sweetalert2";
import { GiWeight, GiSheep, GiGoat } from "react-icons/gi";
import { FaDollarSign } from "react-icons/fa";
import { IoMdMale } from "react-icons/io";
import { FaShapes } from "react-icons/fa";
import { MdCake } from "react-icons/md";
import { HiOutlineBadgeCheck } from "react-icons/hi";
require("bootstrap-less/bootstrap/bootstrap.less");

class Commandes extends Component {
  constructor() {
    super();
    // let redirect = false;
    this.state = {
      nbr: null,
      loading: true,
      activePage: 1,
      nombrePages: [],
      currentPage: 1,
      annoncesPerPage: 8,
      Favoris: [],
      redirect: false,
      activePage: 15,
      panier: [],
      idp: [],
    };
    // this.elv = this.elv.bind(this);
    this.handleDeleteFromFavoris = this.handleDeleteFromFavoris.bind(this);
    this.handlePanier = this.handlePanier.bind(this);
  }
  // elv = (id) => {
  //   axios
  //     .get("http://127.0.0.1:8000/api/mouton/" + id)
  //     .then((res) => {
  //       //  console.log(res.data.objet)
  //       this.setState({ mouton: res.data.objet });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };
  componentDidMount() {
    function appendLeadingZeroes(n) {
      if (n <= 9) {
        return "0" + n;
      }
      return n;
    }

    let current_datetime = new Date();
    let formatted_date =
      current_datetime.getFullYear() +
      "-" +
      appendLeadingZeroes(current_datetime.getMonth() + 1) +
      "-" +
      appendLeadingZeroes(current_datetime.getDate()) +
      " " +
      appendLeadingZeroes(current_datetime.getHours()) +
      ":" +
      appendLeadingZeroes(current_datetime.getMinutes()) +
      ":" +
      appendLeadingZeroes(current_datetime.getSeconds());

    const expiredTimeToken = localStorage.getItem("expiredTimeToken");
    const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");

    if (!token || expiredTimeToken < formatted_date) {
      this.props.history.push("/login");
    } else {
      this.setState({ loading: true }, () => {
        axios
          .get("http://127.0.0.1:8000/api/consommateur/" + token + "/favoris", {
            headers: {
              // "x-access-token": token, // the token is a variable which holds the token
              // "Content-Type": "application/json",
              Authorization: myToken,
            },
          })
          .then((res) => {
            this.setState(
              {
                Favoris: res.data,
                loading: false,
              },
              () => console.log("in call" + this.state.Favoris)
            );
            const pageNumbers = [];
            for (
              let i = 1;
              i <=
              Math.ceil(this.state.Favoris.length / this.state.annoncesPerPage);
              i++
            ) {
              pageNumbers.push(i);
            }
            this.setState({ nombrePages: pageNumbers });
          });
      });
    }

    this.setState(() => {
      axios
        .get("http://127.0.0.1:8000/api/consommateur/" + token + "/panier", {
          headers: {
            // "x-access-token": token, // the token is a variable which holds the token
            "Content-Type": "application/json",
            Authorization: myToken,
          },
        })
        .then((res) => {
          this.setState({
            panier: res.data,
          });
          let p = [];
          this.state.panier.map((e) => {
            p.push(e._id);
          });
          this.setState({ idp: p });
        });
    });
  }
  annonceVision(a) {
    if (a.race === undefined) {
      return " ";
    } else return a.race;
  }
  ispanier(a) {
    return this.state.idp.includes(a);
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
              Authorization: myToken,
            },
          }
        )
        .then(
          this.setState({ nbr: this.state.idp.push(Mid), idp: this.state.idp })
        );

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
  handleDeleteFromFavoris(Mid) {
    const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    if (!token) {
      this.props.history.push("/login");
    } else {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "ml-2 btn btn-success",
          cancelButton: " btn btn-danger",
        },
        buttonsStyling: false,
      });

      swalWithBootstrapButtons
        .fire({
          title: "Etes-vous sûr?",
          text: "Voulez-vous supprimer cette annonce !",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "  Oui !  ",
          cancelButtonText: "  Non !  ",
          reverseButtons: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            axios
              .put(
                "http://127.0.0.1:8000/api/consommateur/" +
                  token +
                  "/favoris/" +
                  Mid,
                {},
                {
                  headers: {
                    //"Content-Type": "application/json",

                    Authorization: myToken,
                  },
                }
              )
              .then(() => {
                this.setState({
                  Favoris: this.state.Favoris.filter(
                    (Favoris) => Favoris._id !== Mid
                  ),
                });
                this.props.history.push("/Favoris");
              });
            Swal.fire({
              title: "Supprimé avec succès ",
              icon: "success",
              width: 400,
              heightAuto: false,
              timer: 1500,
              showConfirmButton: false,
            });
            const pageNumbers = [];
            for (
              let i = 1;
              i <=
              Math.ceil(this.state.Favoris.length / this.state.annoncesPerPage);
              i++
            ) {
              pageNumbers.push(i);
            }
            this.setState({ nombrePages: pageNumbers });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: "Annonce non supprimée ! ",
              icon: "error",
              width: 400,
              heightAuto: false,
              timer: 1500,
              showConfirmButton: false,
            });
          }
        });
    }
  }

  handlePageChange(pageNumber) {
    this.setState({ activePage: pageNumber });
  }

  paginate(pageNumber) {
    this.setState({ currentPage: pageNumber });
  }

  render() {
    var fav = this.state.Favoris.filter((Favoris) => Favoris !== null);
    const indexOfLastAnnonce =
      this.state.currentPage * this.state.annoncesPerPage;
    const indexOfFirstAnnonce = indexOfLastAnnonce - this.state.annoncesPerPage;
    const currentAnnonces = this.state.Favoris.slice(
      indexOfFirstAnnonce,
      indexOfLastAnnonce
    );
    const { loading } = this.state;
    let titre;
    if (fav.length == 1 || fav.length == 0) {
      titre = (
        <h6>
          <span>{fav.length}</span> Annonce{" "}
        </h6>
      );
    } else {
      titre = (
        <h6>
          <span>{fav.length}</span> Annonces{" "}
        </h6>
      );
    }
    return (
      <div>
        {/* //   {/* <!-- Page Preloder --> */}
        {/* <div id="preloder">
           <div className="loader"></div>
        </div>  */}
        <section className="">
          <div className="container">
            <br></br>
            <h3 className="latest-product__item">
              Mes favoris{" "}
              <span style={{ marginLeft: "10px", marginTop: "5px" }}>
                <i className="fa fa-heart" style={{ color: "red" }}>
                  {" "}
                </i>
              </span>
            </h3>
            <div className="row">
              <div className="col-lg-12 col-md-7">
                {/*<!-- Sheeps Grid Section Begin --> */}
                <div className="filter__found text-left">
                  <h6>
                    <span>{titre}</span>
                  </h6>
                </div>
                {loading ? (
                  <div
                    style={{
                      width: "100%",
                      height: "40rem",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Loader
                      type="Oval"
                      color="#7fad39"
                      height="80"
                      width="80"
                    />
                  </div>
                ) : (
                  <div>
                    {this.state.Favoris.length == 0 ? (
                      <div
                        className="text-center my-5"
                        style={{ height: "30rem" }}
                      >
                        <p style={{ color: "#fba502" }}>
                          <i
                            className="fa fa-frown-o fa-5x"
                            aria-hidden="true"
                          ></i>
                        </p>

                        <h3 style={{ color: "#28a745" }}>
                          Liste des favoris vide !
                        </h3>
                      </div>
                    ) : (
                      <div className="row">
                        {currentAnnonces.map((Annonces) => (
                          <div className="col-lg-3 col-md-3 col-sm-6">
                            <div id="anonce" className="product__item">
                              <div
                                className="product__item__pic set-bg"
                                // data-setbg={Annonces.images}
                                // src="Images/sardi1.jpg"
                              >
                                <centre>
                                  {" "}
                                  <img
                                    src={Annonces.image_face}
                                    alt="item"
                                    style={{
                                      borderTopRightRadius: "10%",
                                      borderTopLeftRadius: "10%",
                                      objectFit: "contain",
                                    }}
                                  />
                                </centre>
                                <ul className="product__item__pic__hover">
                                  <li>
                                    <Link to={`/DetailsMouton/${Annonces._id}`}>
                                      <a href="#">
                                        <i className="fa fa-eye"></i>
                                      </a>
                                    </Link>
                                  </li>
                                  <li>
                                    <a
                                      id={Annonces._id}
                                      onClick={(e) =>
                                        this.handleDeleteFromFavoris(
                                          e.currentTarget.id
                                        )
                                      }
                                    >
                                      <i className="fa fa-trash"></i>
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              {Annonces.anoc ? (
                                <h1
                                  style={{
                                    borderRadius: "0% 0% 0% 40%",
                                    fontSize: "14px",
                                  }}
                                  className=" badge badge-success pt-2 w-100  "
                                >
                                  <HiOutlineBadgeCheck className=" mr-1 fa-lg " />
                                  <span>Labélisé ANOC</span>{" "}
                                </h1>
                              ) : (
                                <span className="badge pt-3 w-100 mb-2    ">
                                  {" "}
                                </span>
                              )}

                              <div className="product__item__text p-2 text-justify">
                                <div
                                  className="region"
                                  style={{
                                    color: "#aaa",
                                    fontSize: "15px",
                                    textAlign: "center",
                                  }}
                                >
                                  <i
                                    className="fa fa-map-marker"
                                    style={{ marginRight: "0.5rem" }}
                                  ></i>
                                  {Annonces.localisation}
                                </div>
                                <div
                                  className="product__item__information"
                                  style={{
                                    color: "black",
                                    fontSize: "15px",
                                  }}
                                >
                                  <div className=" nbrm">
                                    <img
                                      style={{
                                        width: "18px",
                                        height: "18px",
                                        marginBottom: "5px",
                                        marginRight: "5px",
                                      }}
                                      data-imgbigurl="Images/sheep-head.png"
                                      src="Images/sheep-head.png"
                                      alt=""
                                    />
                                    {Annonces.espece == "chevre"
                                      ? "Chèvre"
                                      : "Mouton"}
                                    <span className="float-right">
                                      <FaShapes
                                        style={{ marginRight: "5px" }}
                                      />
                                      {" " + Annonces.race}
                                    </span>
                                  </div>

                                  <div>
                                    <MdCake
                                      className=" mr-1 fa-lg "
                                      style={{ marginRight: "5px" }}
                                    />

                                    {Annonces.age + " mois"}

                                    <span className="float-right ">
                                      <GiWeight
                                        className=" mr-1 fa-lg "
                                        style={{ marginRight: "5px" }}
                                      />
                                      {Annonces.poids + " Kg"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="float-left ">
                                      <IoMdMale
                                        className=" mr-1 fa-lg "
                                        style={{
                                          width: "18px",
                                          height: "18px",
                                          marginRight: "5px",
                                        }}
                                      />
                                      {Annonces.sexe}
                                    </span>
                                  </div>
                                  <div
                                    className="float-right "
                                    style={{
                                      color: "#fe6927",
                                      fontSize: "18px",
                                      fontWeight: "1000",
                                      textDecoration: "bold",
                                      alignContent: "center",
                                    }}
                                  >
                                    <FaDollarSign
                                      className=" mr-1 fa-lg "
                                      style={{
                                        width: "18px",
                                        height: "18px",
                                        marginRight: "0.5rem",
                                      }}
                                    />
                                    {Annonces.prix + "  Dhs"}
                                  </div>
                                  <br></br>
                                  {Annonces.statut == "disponible" ? (
                                    <div style={{ textAlign: "center" }}>
                                      <br></br>

                                      {!this.ispanier(Annonces._id) ? (
                                        <button
                                          id={Annonces._id}
                                          className="rounded  text-white bg-success py-1 px-2  "
                                          style={{
                                            fontSize: "16px",
                                            borderWidth: "0px",
                                          }}
                                          onClick={(e) => {
                                            this.handlePanier(
                                              e.currentTarget.id
                                            );
                                          }}
                                        >
                                          <i className="fa fa-shopping-cart ">
                                            {" "}
                                            {""} ajouter au Panier
                                          </i>
                                        </button>
                                      ) : (
                                        <>
                                          <br></br>
                                        </>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}{" "}
                  </div>
                )}
                <div className="center-div">
                  <Pagination
                    activePage={this.state.currentPage}
                    itemsCountPerPage={9}
                    totalItemsCount={this.state.Favoris.length}
                    pageRangeDisplayed={7}
                    onChange={this.paginate.bind(this)}
                    itemClass="page-item"
                    linkClass="page-link"
                  />
                </div>

                <br></br>
                {/* <!-- Sheeps Grid Section End --> */}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
export default Commandes;
