import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FaClipboardCheck } from "react-icons/fa";
import Rating from "@material-ui/lab/Rating";
import Box from "@material-ui/core/Box";
import Switch from "react-switch";
import { FaShapes } from "react-icons/fa";
import Select from "react-select";
import { HiOutlineBadgeCheck } from "react-icons/hi";

import { Redirect } from "react-router";
import Swal from "sweetalert2";
import axios from "axios";
class ConfirmeCommande extends Component {
  constructor(props) {
    super(props);
    // let redirect = false;
    this.state = {
      commandes: this.props.location.state.id,

      show1: "collapse show",
      show2: "collapse show",
      show3: "collapse show",
      showMotif: false,
      ratingLivraison: 0,
      ratingProduit: 0,
      conforme: false,
      rejete: false,
      optionsMotif: [],
      optionsMotifs: [
        {
          value: "Numéro de boucle non conforme",
          label: "Numéro de boucle non conforme",
        },
        { value: "Produit avarié", label: "Produit avarié" },
      ],

      selectedOptionMotif: "",
      selectedOptionMotifs: "",

      motif: null,
      motifs: null,
    };
    this.valider = this.valider.bind(this);
  }

  handleChangeEtat(CR) {
    if (CR === "conforme") {
      this.setState({
        conforme: !this.state.conforme,
        rejete: false,
        selectedOptionMotifs: null,
      });
    } else if (CR === "rejete") {
      this.setState({ conforme: false, rejete: !this.state.rejete });
    }
  }

  componentDidMount() {
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    console.log(this.props.location.state.id);
    console.log(this.props.location.state.id.animateur.parametrage_global);

    this.props.location.state.id.animateur.parametrage_global.motif_annulation.map(
      (m) => this.state.optionsMotif.splice(0, 0, { value: m, label: m })
    );
  }
  handleChangeMotif = (selectedOptionMotif) => {
    this.setState({ selectedOptionMotif }, () =>
      this.setState({
        motif: selectedOptionMotif.value,
      })
    );
  };
  handleChangeMotifs = (selectedOptionMotifs) => {
    if (selectedOptionMotifs.value === "Produit avarié") {
      this.setState({ showMotif: true });
    } else {
      this.setState({ showMotif: false });
    }

    this.setState({ selectedOptionMotifs }, () =>
      this.setState({
        motifs: selectedOptionMotifs.value,
      })
    );
  };
  valider() {
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "ml-3 btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });
    console.log(this.state.conforme);
    console.log(this.state.rejete);
    console.log(this.state.motifs);
    console.log(this.state.motif);

    if (
      this.state.conforme === true ||
      (this.state.rejete === true &&
        (this.state.motifs == "Numéro de boucle non conforme" ||
          (this.state.motifs == "Produit avarié" &&
            this.state.motif != "" &&
            this.state.motif != null)))
    ) {
      swalWithBootstrapButtons
        .fire({
          title: "Etes-vous sûr?",
          text: "Voulez-vous confirmer votre evaluation !",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "  Oui!  ",
          cancelButtonText: "  Non!  ",
          reverseButtons: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            axios
              .put(
                "http://127.0.0.1:8000/api/commande/" +
                  this.state.commandes._id,
                {
                  rating_livraison: this.state.ratingLivraison,
                  rating_produit: this.state.ratingProduit,
                  motif_rejet:
                    this.conforme === true
                      ? "Numéro de boucle non conforme"
                      : this.state.selectedOptionMotif.value,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: myToken,
                  },
                }
              )
              .then((res) => {
                this.setState(
                  {
                    commandes: res.data.Objet,
                  },
                  () => {
                    swalWithBootstrapButtons.fire(
                      "confirmation et evalution validées!",
                      "Votre confirmation et evalution ont bien été enregistrés",
                      "success"
                    );
                    this.props.history.push("./commandesParStatut");
                  }
                );
              });
          } else {
            swalWithBootstrapButtons.fire(
              "Annulation !",
              "Votre confirmation et evalution ont bien été annulées",
              "error"
            );
          }
        });
    }
  }

  setValue(val, PL) {
    if (val != null) {
      if (PL === "livraison") {
        this.setState({ ratingLivraison: val }, () => {});
      } else if (PL === "produit") {
        this.setState({ ratingProduit: val }, () => {});
      }
    }
  }
  render() {
    //  if (this.state.redirect) {
    // return <Redirect to="./commandesParStatut" />;
    //}
    const commandes = this.state.commandes;

    return (
      <div>
        <style>{`.btn-link {  color:white} .btn-link:hover {color:white;} .card { background-color: #fafafa !important } .container {max-width: 90%;}  `}</style>
        <div className="container">
          <h3>Confirmation et évaluation </h3>
          <br></br>
          <div>
            <div id="accordion">
              <div className="card">
                <div
                  className="card-header p-0"
                  style={{ backgroundColor: "#009141" }}
                  id="headingTwo"
                >
                  <h5 className="mb-0">
                    <button className="btn btn-link collapsed">
                      <h5 style={{ color: "white" }}>
                        <FaClipboardCheck className="mb-2" /> Réception de la
                        livraison{" "}
                      </h5>{" "}
                    </button>
                  </h5>
                </div>
                <div className="">
                  <div id="collapseTwo" className={this.state.show1}>
                    <div className="card-body">
                      <div id="centrer" className="col-lg-12 col-md-6">
                        <div className="shoping__checkout mt-2 pb-0">
                          <h6>
                            {" "}
                            Reçue et conforme{" "}
                            <Switch
                              onChange={this.handleChangeEtat.bind(
                                this,
                                "conforme"
                              )}
                              checked={this.state.conforme}
                              height={20}
                              width={48}
                            />
                          </h6>
                          <br></br>
                          <h6>
                            {" "}
                            Rejetee car non conforme{" "}
                            <Switch
                              onChange={this.handleChangeEtat.bind(
                                this,
                                "rejete"
                              )}
                              checked={this.state.rejete}
                              height={20}
                              width={48}
                            />
                          </h6>
                          <br></br>

                          {this.state.rejete === true ? (
                            <>
                              <div className=" font-weight-bold mt-2">
                                <FaShapes /> motif de rejet
                              </div>
                              <br></br>
                              <div className="w-75">
                                <Select
                                  value={this.state.selectedOptionMotifs}
                                  onChange={this.handleChangeMotifs}
                                  options={this.state.optionsMotifs}
                                  placeholder="A choisir"
                                  name="selectedOptionMotif"
                                />
                              </div>{" "}
                              <div className="w-75">
                                {this.state.showMotif ? (
                                  <Select
                                    value={this.state.selectedOptionMotif}
                                    onChange={this.handleChangeMotif}
                                    options={this.state.optionsMotif}
                                    placeholder="Motif de rejet"
                                    name="selectedOptionMotif"
                                    className="mt-2"
                                  />
                                ) : null}{" "}
                              </div>{" "}
                            </>
                          ) : null}
                        </div>
                        <br></br>

                        <h6
                          style={{
                            color: "#bb2124",
                            marginTop: "4px",
                            marginBottom: "10px",
                          }}
                        >
                          <b>
                            Pour toute réclamation, contactez le service client
                            au 0601120156. Disponible de 9h à 19h sauf Samedi et
                            Dimanche.
                          </b>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div
                  className="card-header p-0"
                  style={{ backgroundColor: "#009141" }}
                  id="headingThree"
                >
                  <h5 className="mb-0">
                    <button className="btn btn-link collapsed">
                      <h5 style={{ color: "white" }}>
                        <FaClipboardCheck className="mb-2" /> Evaluation
                      </h5>{" "}
                    </button>
                  </h5>
                </div>
                <div id="collapseThree" className={this.state.show2}>
                  <div className="card-body">
                    <div id="centrer" className="col-lg-12 col-md-6">
                      <div className="shoping__checkout mt-2 pb-0">
                        <Box
                          component="fieldset"
                          mb={3}
                          borderColor="transparent"
                        >
                          <div>
                            <b style={{ fontSize: "20px" }} className="mr-3">
                              Livraison
                            </b>
                            <Rating
                              name="livraison"
                              value={this.state.ratingLivraison}
                              onChange={(event, newValue) => {
                                this.setValue(newValue, "livraison");
                              }}
                            />
                          </div>
                        </Box>
                        <Box
                          component="fieldset"
                          mb={3}
                          borderColor="transparent"
                        >
                          <b style={{ fontSize: "20px" }} className="mr-3">
                            Produit
                          </b>
                          <Rating
                            name="produit"
                            value={this.state.ratingProduit}
                            onChange={(event, newValue) => {
                              this.setValue(newValue, "produit");
                            }}
                          />
                        </Box>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-5">
                <div className="row">
                  <div className="col-md-4 offset-md-4">
                    <button
                      style={{ fontSize: "19px" }}
                      id="centre"
                      onClick={this.valider}
                      className="btn-success py-1 px-4 mb-3 w-75"
                    >
                      {" "}
                      Valider{" "}
                    </button>{" "}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfirmeCommande;
