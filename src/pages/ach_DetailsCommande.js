import React, { Component, useState } from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import { FaClipboardCheck } from 'react-icons/fa';
import { BsFileEarmarkPlus } from 'react-icons/bs'
import { BiTrash } from 'react-icons/bi'
import { Prompt } from 'react-router'
import { HiOutlineBadgeCheck } from 'react-icons/hi';
import { Modal, Button } from 'react-bootstrap';
import { Redirect } from "react-router";
import Swal from "sweetalert2";
import axios from "axios";
class DetailsCommande extends Component {
  constructor(props) {
    super(props);
    // let redirect = false;
    this.state = {
      cloture:false,
      connectedUserEmail: "",
      espece_changement: '',
      etat: '',
      nom_prenom: '',
      commandes: this.props.location.state.id,
      rib: '',
      cooperative: null,
      cooperative_rib: '',
      tech: '',
      payer: '',
      Especes: [],
      showAvance: false,
      showSolution: false,
      showRemb: false,
      showChoix: false,
      prixRemb: 0,
      prix_transport: 0,
      especeAv: {},
      especesAv: [],
      redirect: false,
      image: "",
      errors: {},
      date: Date,
      mode_paiement_choisi: this.props.location.state.id.mode_paiement_choisi,
      dataUrl: "",
      ids: localStorage.getItem("ids") ? (Array.isArray(localStorage.getItem("ids")) ? localStorage.getItem("ids") :
        localStorage.getItem("ids").split(",")) : [],
      reponses: localStorage.getItem("reponses") ? JSON.parse(localStorage.getItem("reponses")) : [],

    };

    this.onChange = this.onChange.bind(this);
    this.Modal = this.Modal.bind(this);
    this.ModalS = this.ModalS.bind(this);
    this.Hide = this.Hide.bind(this);

    this.RefuseTSoutions = this.RefuseTSoutions.bind(this);
    this.AccepteSoution = this.AccepteSoution.bind(this);
    this.handleValidation = this.handleValidation.bind(this);
    this.handelDeleteEspece = this.handelDeleteEspece.bind(this);
    this.handelDelete = this.handelDelete.bind(this);
    this.handleChangeImage = this.handleChangeImage.bind(this);
    this.handlePut = this.handlePut.bind(this);
    this.handlPost = this.handlPost.bind(this);
    this.reinitialiserCmd = this.reinitialiserCmd.bind(this);


  }
  Hide(){
    this.setState({showChoix:false,showRemb:false,showSolution:false},()=>{})
  }
  componentDidUpdate = () => {
    if(this.state.cloture===false){  if (this.state.ids.length == 0 ||
      this.state.ids.length == this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length
      || this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length == 0) {
      window.onbeforeunload = undefined
    } else {

      window.onbeforeunload = function (e) {
        e.preventDefault();
        e.returnValue = '';
        return "stop";

      }

    }

    if (this.state.ids.length != 0 &&
      this.state.ids.length == this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length
      && this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length != 0) {
      const myToken = `Bearer ` + localStorage.getItem("myToken");

      axios
        .put(
          "http://127.0.0.1:8000/api/commandeStatut/" + this.state.commandes._id,
          {
            all: this.state.reponses,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": myToken,
            },
          }
        )
        .then((res) => {
          this.setState({cloture:true},()=>{ Swal.fire({
            title: "Changer avec succès ",
            icon: "success",
            width: 400,
            heightAuto: false,
            timer: 1500,
            showConfirmButton: false,

          })})
         

        })
    }}
  
  }
  handleValidation() {
    let errors = {};
    let valide = true;

    if (this.state.nom_prenom.length == 0 || this.state.nom_prenom == " ") {

      errors["nom_prenom"] = "Ce champs est obligatoire ";
      valide = false;
    }
    if (this.state.rib.length == 0) {
      errors["rib"] = "Ce champs est obligatoire ";
      valide = false;
    }
    if (this.state.rib.length != 0 && this.state.rib.length != 24) {
      errors["rib"] = " Le rib doit contenir 24 caractères ";
      valide = false;
    }
    this.setState({ errors: errors })
    return valide;

  }
  handlPost(e) {
    e.preventDefault();
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    if (this.handleValidation()) {
      //rembourssement

      if (this.state.etat == "refuser") {
        axios
          .put(
            "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id + 
            "/" + this.state.especeAv._id,
            {
              nom: this.state.nom_prenom,
              rib: this.state.rib,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": myToken,
              },
            }
          )
          .then((res) => { 
             console.log(res.data)
            this.state.ids.push(this.state.especeAv._id)
            this.state.reponses.push(res.data)
            localStorage.setItem("ids", this.state.ids)
            localStorage.setItem("reponses", JSON.stringify(this.state.reponses))
            let espsAv = this.state.especesAv;

            espsAv[(espsAv.indexOf(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]))].etat = res.data;


            this.setState({ showChoix:true,showRemb:false,especesAv: espsAv, showSolution: !this.state.showSolution }, () => {
              Swal.fire({
                title: "Changer avec succès ",
                icon: "success",
                width: 400,
                heightAuto: false,
                timer: 1500,
                showConfirmButton: false,

              })
            })
          })
      }
      //rembourssement pour changement (old.prix>new.prix)
      if (this.state.etat == "accepter") {
        axios
          .put(
            "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id
            + "/" + this.state.especeAv._id
            + "/" + this.state.espece_changement._id,
            {
              nom: this.state.nom_prenom,
              rib: this.state.rib,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": myToken,
              },
            }
          )
          .then((res) => {
           
            this.state.ids.push(this.state.especeAv._id)
            this.state.reponses.push(res.data)
            localStorage.setItem("ids", this.state.ids)
            localStorage.setItem("reponses", JSON.stringify(this.state.reponses))
            let espsAv = this.state.especesAv;

            espsAv[(espsAv.indexOf(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]))].etat = res.data;
           espsAv[(espsAv.indexOf(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]))].choix =  this.state.espece_changement;
            this.setState({ showChoix:true,showRemb:false,especesAv: espsAv, showSolution: !this.state.showSolution }, () => {
              Swal.fire({
                title: "Changer avec succès ",
                icon: "success",
                width: 400,
                heightAuto: false,
                timer: 1500,
                showConfirmButton: false,

              })
            })
          })

      }

    }


  }
  getEspece(espece) {
    let esp = this.state.commandes.especes.filter((e) => (e.id_espece === espece._id))[0];
    let motif = "";
    switch (esp.motif_annulation) {
      case 'Apparition d\'un abcès':
        motif = "Apparition d\'un abcès";
        break;
      case 'Jetage du nez':
        motif = "Ecoulement nasales";
        break;
      case 'Conjonctivite':
        motif = "Une inflammation de la conjonctive de l'œil";
        break;
      case 'Ictère':
        motif = "Une coloration jaune de la peau, des conjonctives et d'autres tissus";
        break;
      case 'Fracture':
        motif = "Fracture";
        break;
      case 'Boitréé':
        motif = "Boitréé";
        break;
      default:
        motif = esp.motif_annulation;
    }

    esp.motif_annulation = motif;
    return esp;
  }
  handelDeleteEspece(espece) {
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "mx-3 btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons.fire({
      title: "Etes-vous sûr?",
      text: "Voulez-vous annuler cette espece!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "  Oui!  ",
      cancelButtonText: "  Non!  ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.state.commandes.especes.length === 1) {
          axios
            .delete(
              "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id,
              {
                headers: {
                  "Authorization": myToken,
                },
              }
            )
            .then((res) => {
              axios
                .put(
                  "http://127.0.0.1:8000/api/Espece/" + espece._id,
                  {
                    statut: "disponible",
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": myToken,
                    },
                  }
                )
                .then((res) => {
                   this.props.history.push("./commandesParStatut");
                  swalWithBootstrapButtons.fire(
                    'Annulation !',
                    'Votre espece a bien été annulée',
                    'success'
                  )
                  window.location.reload();


                });
            })



        }
        else if (this.state.commandes.especes.length > 1) {
          axios
            .put(
              "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id
              + "/espece/" + espece._id,
              {
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": myToken,
                },
              }
            )
            .then((res) => {
              let all = this.state.commandes;
              all.espece = this.state.commandes.espece.filter((f) => f._id != espece._id);
              all.especes = this.state.commandes.especes.filter((f) => f.id_espece != espece._id);

              if (all.reçu_avance == null) {
                all.avance = (all.avance - espece.avance);
                all.prix_total = (all.prix_total - espece.prix);
                all.reste = (all.prix_total - all.avance);

              }

              if (all.reçu_avance != null) {
                all.prix_total = (all.prix_total - espece.prix) - (- espece.avance);
                all.reste = (all.prix_total - all.avance);
              }
 
              this.setState({
                commandes: all,

              }, () => {

                swalWithBootstrapButtons.fire(
                  'Annulation !',
                  'Votre espece a bien été annulée',
                  'success'
                )
              })
            })



        }



      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Annulation',
          'Espece non annulée !',
          'error'
        )
      }
    })
  }
  handelDelete = (e) => {
    e.preventDefault();
    // const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    let espece = this.state.commandes.espece;
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "mx-3 btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons.fire({
      title: "Etes-vous sûr?",
      text: "Voulez-vous annuler votre commande!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "  Oui!  ",
      cancelButtonText: "  Non!  ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        //debut
        axios
          .delete(
            "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id,
            {
              headers: {
                "Authorization": myToken,
              },
            }
          )
          .then((res) => {
            espece.map((esp) => {
              axios
                .put(
                  "http://127.0.0.1:8000/api/Espece/" + esp._id,
                  {
                    statut: "disponible",
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": myToken,
                    },
                  }
                )
                .then((res) => {
                });
            })

            swalWithBootstrapButtons.fire(
              'Annulation !',
              'Votre commande a bien été annulée',
              'success'
            )
            this.props.history.push("./commandesParStatut");

          });

      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Annulation',
          'Commande non annulée !',
          'error'
        )
      }
    })
  }

  handlePut = (e) => {
    e.preventDefault();
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    if (this.state.payer === "avance") {
      //paiement
      axios
        .put(
          "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id,
          {
            statut: "en attente de validation avance",
            reçu_avance: this.state.dataUrl,
            avance_transmis_le: new Date(),
            mode_paiement_choisi: this.state.mode_paiement_choisi,

          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": myToken,
            },
          }
        )
        .then((res) => {

          Swal.fire({
            text:
              "Vous allez recevoir un email de validation de votre reçu sur votre email : " + this.state.commandes.consommateur.email,
            icon: "success",
            width: 400,
            heightAuto: false,
            confirmButtonColor: "#7fad39",

            confirmButtonText: "Ok!",
          });
          this.props.history.push("/commandesParStatut");

        });
    }
    else if (this.state.payer === "reste") {
      axios
        .put(
          "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id,
          {
            statut: "en attente de validation reste",
            reçu_montant_restant: this.state.dataUrl,
            reste_transmis_le: new Date(),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": myToken,
            },
          }
        )
        .then((res) => {
          Swal.fire({
            text:
              "Vous allez recevoir un email de validation de votre reçu sur votre email : " + this.state.commandes.consommateur.email,
            icon: "success",
            width: 400,
            heightAuto: false,
            confirmButtonColor: "#7fad39",

            confirmButtonText: "Ok!",
          });
          this.props.history.push("/commandesParStatut");
        });
    }
    else if (this.state.payer === "complement") {
      axios
        .put(
          "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id,
          {
            statut: "en attente de validation du complément",
            reçu_montant_complement: this.state.dataUrl,
            complement_transmis_le: new Date(),

          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": myToken,
            },
          }
        )
        .then((res) => {
          Swal.fire({
            text:
              "Vous allez recevoir un email de validation de votre reçu sur votre email : " + this.state.commandes.consommateur.email,
            icon: "success",
            width: 400,
            heightAuto: false,
            confirmButtonColor: "#7fad39",

            confirmButtonText: "Ok!",
          });
          this.props.history.push("/commandesParStatut");
        });
    }
    const to = this.state.connectedUserEmail;
    const content =
      "Votre reçu a bien ete receptionne";
    const subject =
      "Reçu de paiement ( " + this.state.payer + " )";
    axios.post(
      "http://127.0.0.1:8000/api/sendmail/" +
      to +
      "/" +
      content +
      "/" +
      subject,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",

          // "Access-Control-Allow-Origin": "*",
        },
      }
    );

  };



  handleChangeImage(evt) {
    var dataURL = "";
    var reader = new FileReader();
    var file = evt.target.files[0];
    const scope = this;
    reader.onload = function () {
      dataURL = reader.result;
      scope.setState({ dataUrl: dataURL });
    };
    reader.readAsDataURL(file);
  }

  Modal(payer) {

    this.setState({ showAvance: !this.state.showAvance, payer: payer, mode_paiement_choisi: this.state.mode_paiement_choisi }, () => { });

  }
  AccepteSoution(espece) {
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "ml-2 btn btn-success",
        cancelButton: " btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons.fire({
      title: "Etes-vous sûr?",
      text: "Voulez-vous changer cette annonce !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "  Oui !  ",
      cancelButtonText: "  Non !  ",
      reverseButtons: true,
    }).then((result) => {

      if (result.isConfirmed) {
        this.setState({ etat: "accepter", espece_changement: espece }, () => { });

        //ancien_statut validé =>Montant du produit avarié a remboursé par l'ANOC
        if (this.state.commandes.ancien_statut === "validé" && espece.prix < this.state.especeAv.prix) {
          this.setState({ prixRemb: this.state.especeAv.prix - espece.prix, showRemb: !this.state.showRemb }, () => { });
        }
        else {
          axios
            .put(
              "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id
              + "/" + this.state.especeAv._id
              + "/" + espece._id,
              {
                nom: this.state.nom_prenom,
                rib: this.state.rib,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": myToken,
                },
              }
            )
            .then((res) => {
              this.state.ids.push(this.state.especeAv._id)
              this.state.reponses.push(res.data)
              localStorage.setItem("ids", this.state.ids)
              localStorage.setItem("reponses", JSON.stringify(this.state.reponses))

              let espsAv = this.state.especesAv;
 
              espsAv[(espsAv.indexOf(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]))].etat = res.data;
              espsAv[(espsAv.indexOf(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]))].choix = espece;

              this.setState({ especesAv: espsAv, showSolution: !this.state.showSolution }, () => {
                
              });
            })
          Swal.fire({
            title: "change avec succès ",
            icon: "success",
            width: 400,
            heightAuto: false,
            timer: 1500,
            showConfirmButton: false,

          });
        }
      }


      else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire({
          title: "Annonce non changee ! ",
          icon: "error",
          width: 400,
          heightAuto: false,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    })






  }
  RefuseTSoutions() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "ml-2 btn btn-success",
        cancelButton: " btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons.fire({
      title: "Etes-vous sûr?",
      text: "Voulez-vous refuser les produits de changements  !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "  Oui !  ",
      cancelButtonText: "  Non !  ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        //code 
        //fin code
        this.setState({ etat: "refuser" }, () => {
          //ancien_statut en attente de paiement avance=>soustraire le montant du produit initial
          const myToken = `Bearer ` + localStorage.getItem("myToken");

          if (this.state.commandes.ancien_statut === "en attente de paiement avance") {
            this.setState({ showRemb: !this.state.showRemb,showChoix:true }, () => {
              axios
                .put(
                  "http://127.0.0.1:8000/api/commande/" +
                  this.state.commandes._id + "/" + this.state.especeAv._id,
                  {
                    nom: this.state.nom_prenom,
                    rib: this.state.rib,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": myToken,
                    },
                  }
                )
                .then((res) => {
                  this.state.ids.push(this.state.especeAv._id)
                  this.state.reponses.push(res.data)
                   localStorage.setItem("ids", this.state.ids)
                  localStorage.setItem("reponses", JSON.stringify(this.state.reponses))
                  let espsAv = this.state.especesAv;

                  espsAv[(espsAv.indexOf(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]))].etat = res.data;
 
                  this.setState({ especesAv: espsAv},()=>{
                       Swal.fire({
                    title: "Annule avec succès ",
                    icon: "success",
                    width: 400,
                    heightAuto: false,
                    timer: 1500,
                    showConfirmButton: false,

                  });})
               
                })
            });
          }

          //ancien_statut en attente de paiement du reste =>
          //Montant reste à payer = Montant reste initial - prix total produit avarié  | avance a remboursé par l'ANOC
          if (this.state.commandes.ancien_statut === "en attente de paiement du reste") {
            this.setState({ prixRemb: this.state.especeAv.avance, showRemb: !this.state.showRemb }, () => { });
          }

          //ancien_statut validé =>Montant du produit avarié a remboursé par l'ANOC
          if (this.state.commandes.ancien_statut === "validé") {
            this.setState({ prixRemb: this.state.especeAv.prix, showRemb: !this.state.showRemb }, () => { });
          }
        });

      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire({
          title: "Non refuser ! ",
          icon: "error",
          width: 400,
          heightAuto: false,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    })






  }
  ModalS(espece) {
    if( this.state.especesAv.filter((e) => e.id == espece._id)[0].etat !==null)
    {
      this.setState({ showChoix: true, showSolution: false,especeAv: espece  }, () => { });  
    }
    else {
      this.setState({showChoix:false},()=>{ 
            if (this.state.commandes.especes.filter((f) => f.id_espece == espece._id)[0].produits_changement.length == 0) {
      this.setState({ etat: "refuser", especeAv: espece }, () => {
        //ancien_statut en attente de paiement avance=>soustraire le montant du produit initial

        if (this.state.commandes.ancien_statut === "en attente de paiement avance") {
          this.setState({  showRemb: !this.state.showRemb, showSolution: !this.state.showSolution }, () => {
          });
        }

        //ancien_statut en attente de paiement du reste =>
        //Montant reste à payer = Montant reste initial - prix total produit avarié  | avance a remboursé par l'ANOC
        if (this.state.commandes.ancien_statut === "en attente de paiement du reste") {
          this.setState({ prixRemb: this.state.especeAv.avance, showRemb: !this.state.showRemb }, () => { });
        }

        //ancien_statut validé =>Montant du produit avarié a remboursé par l'ANOC
        if (this.state.commandes.ancien_statut === "validé") {
          this.setState({ prixRemb: this.state.especeAv.prix, showRemb: !this.state.showRemb }, () => { });
        }
      })
    }
    else {
      let tab = [];
      this.setState({ showRemb: false, showSolution: !this.state.showSolution, especeAv: espece }, () => {
        if (espece != undefined && espece != {} && espece != null && Object.keys(espece).length > 0) {
          tab[0] = espece;
          tab[1] = this.state.commandes.especes.filter((e) => (e.id_espece == espece._id))[0];
          tab[2] = [];
          tab[1].produits_changement.map((e) => {
            tab[2].push(this.state.commandes.espece_avariee.filter((esp) => (esp._id == e.id_espece))[0]);
          })
        } this.setState({ Especes: tab }, () => { })
      });

    }})
   
    }
  

  }
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value }, () => {

    });
  }
  reinitialiserCmd = () => {
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    let cmdreplace = this.props.location.state.id;
    Swal.fire({
      title: "Changement annuler ",
      icon: "error",
      width: 400,
      heightAuto: false,
      timer: 1500,
      showConfirmButton: false,

    })
     console.log(this.props.location.state.id._id)
    axios
      .put(
        "http://127.0.0.1:8000/api/commande/" + this.props.location.state.id._id,
        {
          statut: cmdreplace.statut,
          ancien_statut: cmdreplace.ancien_statut,
          especes: cmdreplace.especes,
          reste: cmdreplace.reste,
          avance: cmdreplace.avance,
          prix_total: cmdreplace.prix_total,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": myToken,
          },
        }
      )
      .then((res) => {
            localStorage.setItem('ids', []);
      localStorage.setItem('reponses', []);
      })
  }

  componentWillUnmount() {

    if (this.state.ids.length == 0 ||
      this.state.ids.length == this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length
      || this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length == 0) {

    } else {
   
      this.reinitialiserCmd();

    }

  }


  componentDidMount() {
    window.addEventListener("load", (ev) => {
      ev.preventDefault();
      if (!(this.state.ids.length == 0 ||
        this.state.ids.length == this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length
        || this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length == 0)) {
         localStorage.setItem('ids', []);
        localStorage.setItem('reponses', []);
        this.setState({
          commandes: this.props.location.state.id,
          ids: [], reponses: []
        })
        this.reinitialiserCmd();


      }

    });

    const myToken = `Bearer ` + localStorage.getItem("myToken");
    const token = localStorage.getItem("usertoken");
    const expiredTimeToken = localStorage.getItem("expiredTimeToken");
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
    const cmd = this.props.location.state.id;
    var currentdate = new Date(cmd.date_creation);
    //  currentdate = Date.parse(cmd.date_creation);
    var day = currentdate.getDate();
    var month = currentdate.getMonth() + 1;
    var year = currentdate.getFullYear();
    var hours = currentdate.getHours();

    if (hours > 8 && hours < 16) {
      var day = day;
      var month = month;
      var year = year;
      var hours = 16;
    }
    if ((hours > 16 && hours < 24) || hours == "00") {
      var day = day + 1;
      var month = month;
      var year = year;
      var hours = 12;
    }
    if (hours > 1 && hours < 8) {
      var day = day;
      var month = month;
      var year = year;
      var hours = 12;
    }

    var datetime = day + "/" + month + "/" + year + " à " + hours + ":00:00";
    // this.setState({ date: datetime });
    let espsAv = [];
    this.props.location.state.id.espece.filter((e) => e.statut == "produit avarié").map(
      (esp) => {
        espsAv.push({ "id": esp._id, "etat":null,"choix":null })
      }
    )
    this.setState({ especesAv: espsAv }, () => {
     })


    if (!token || expiredTimeToken < formatted_date) {
      this.props.history.push("/login");
    } else {
      axios
        .get("http://127.0.0.1:8000/api/cooperative/" + this.props.location.state.id.id_cooperative, {
          headers: {
            // "x-access-token": token, // the token is a variable which holds the token
            "Content-Type": "application/json",
            "Authorization": myToken,
          },
        })

        .then((res) => {

          this.setState({
            especesAv: espsAv,
            cooperative: res.data,
            prix_transport: this.props.location.state.id.ville_livraison === "Récupérer à la coopérative" ? 0 : res.data.parametres.livraison.filter((v) => v.Ville_livraison === this.props.location.state.id.ville_livraison)[0].prix_transport
          }
            , () => {
              this.setState({ cooperative_rib: this.state.cooperative.rib, tech: this.state.cooperative.tech[0].prenom + " " + this.state.cooperative.tech[0].nom });
              axios
                .get("http://127.0.0.1:8000/api/consommateur/" + token, {
                  headers: {
                    "Content-Type": "application/json",
                    // "Authorization": Mytoken,
                  },
                })

                .then((res) => {
                  this.setState({ connectedUserEmail: res.data.email });
                })
            })
        });
    }


  }

  handelDelete() {
    // const token = localStorage.getItem("usertoken");
    const myToken = `Bearer ` + localStorage.getItem("myToken");
    // if (!token) {
    //   this.props.history.push("/login");
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons.fire({
      title: "Etes-vous sûr?",
      text: "Voulez-vous annuler votre commande!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "  Oui!  ",
      cancelButtonText: "  Non!  ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        //debut
        axios
          .delete(
            "http://127.0.0.1:8000/api/commande/" + this.state.commandes._id,
            {
              headers: {
                // "x-access-token": token, // the token is a variable which holds the token
                "Authorization": myToken,
              },
            }
          )
          .then((res) => {
            axios
              .put(
                "http://127.0.0.1:8000/api/Espece/" +
                this.state.commandes.id_espece,
                {
                  statut: "disponible",
                  //   msg_refus_avance: this.state.dataUrl,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": myToken,
                  },
                }
              )
              .then((res) => {

                // this.props.history.replace("/commandesParStatut");
                this.setState({ redirect: true });
              }); swalWithBootstrapButtons.fire(
                'Annulation !',
                'Votre commande a bien été annulée',
                'success'
              )
          });

        //fin
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Annulation',
          'Commande non annulée !',
          'error'
        )
      }
    })
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to="./commandesParStatut" />;
    }
    let ids = localStorage.getItem("ids") ? (Array.isArray(localStorage.getItem("ids")) ? localStorage.getItem("ids") :
      localStorage.getItem("ids").split(",")) : [];
    let especesAv = this.state.especesAv;




    const commandes = this.state.commandes;
    let prix = this.state.commandes.espece.reduce(function (prev, cur) { return prev - (- cur.prix); }, 0)
    let prix_transport = this.state.prix_transport;
    return (
      <React.Fragment>
        <Prompt

          when={
            !(ids.length == 0 ||
              ids.length == this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length
              || this.state.commandes.espece.filter((e) => e.statut == "produit avarié").length == 0)

          }
          message='Voulez-vous vraiment quitter cette page ? Les modifications que vous avez apportées ne seront pas enregistrées'
        />
        <div>
          <style>{`.btn-link {  color:white} .btn-link:hover {color:white;} .card { background-color: #fafafa !important } .container {max-width: 90%;}  `}</style>
          <div className="container">
            <h3>Détails commande  </h3>
            <br></br>
            <div>
              <div id="accordion">

                {commandes.espece.filter((e) => e.statut == "produit avarié").length>0
                  ?
                  <div className="card">
                    <div className="card-header p-0" style={{ backgroundColor: "#009141" }} id="headingfour">
                      <h5 className="mb-0">
                        <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapsefour" aria-expanded="true" aria-controls="collapsefour">
                          <h5 style={{ color: "white" }}><FaClipboardCheck className="mb-2" /> {" "}Motif de l'annulation
                      </h5>  </button>
                      </h5>
                    </div>
                    <div id="collapsefour" className="collapse show" aria-labelledby="headingfour" data-parent="#accordion">
                      <div className="card-body">

                        <br></br>

                        <ul>
                          <div className="row">
                            {commandes.espece.filter((e) => e.statut == "produit avarié").map((Annonces) =>
                            (<div className="col-lg-3  col-sm-6">
                              <span className="text-danger">
                                <i className="fa fa-long-arrow-right" aria-hidden="true"> </i>
                                <b>{this.getEspece(Annonces).motif_annulation}</b> </span>
                              <div id="anonce" className="product__item"
                                style={{ backgroundRepeat: "no-repeat", backgroundImage: "linear-gradient(rgb(255,153,153), rgb(255,204,204))", backgroundSize: "cover" }}
                              >
                                <div
                                  className="product__item__pic set-bg"
                                  data-setbg={Annonces.images}
                                >
                                  <img
                                    src={Annonces.image_face}
                                    className="product__item__pic set-bg"
                                  />


                                </div>
                                {Annonces.anoc ?
                                  <h1 style={{ borderRadius: "0% 0% 0% 40%", fontSize: "14px" }} className=" badge badge-success py-1 w-100  ">
                                    <HiOutlineBadgeCheck className=" mr-1 fa-lg " />
                                    <span>Labélisé ANOC</span>  </h1>
                                  :
                                  <span className="badge pt-3 w-100  mt-1  " >{"  "}</span>
                                }
                                <div className="product__item__text p-2 text-justify"
                                >
                                  <h6 className=""><b>№ Boucle</b> : {Annonces.boucle}</h6>
                                  <h6 className=""><b>Categorie</b> : {Annonces.categorie}</h6>
                                  <h6 className=""><b>Race :</b> {Annonces.race}</h6>
                                  <h6 className=""><b>Poids : </b>{Annonces.poids} Kg</h6>
                                  <h6 className=""><b>Age :</b> {Annonces.age} mois</h6>
                                  <h6 className=""><b>Localisation :</b> {Annonces.localisation}</h6>
                                  <h5 className=" text-danger  ">
                                    <i className="fa fa-usd" aria-hidden="true"></i>
                                    {" "}
                                    {Annonces.prix + "  Dhs"}
                                  </h5>
                                  <div className="row mt-3">
                                    <div className="col-2">{" "}</div>
                                    <button type="button" onClick={this.ModalS.bind(this, Annonces)} className="col-8 py-1 btn btn-success">
                                    
                                       {especesAv.length>0? 
                                      ( especesAv.filter((e) => e.id == Annonces._id)[0].etat ==null?
                                     " Solutions proposées" :"Solution choisi"):
                                      " Solutions choisi" }
                                    
                                    </button>
                                    <div className="col-2">{" "}</div>
                                  </div>
                                </div> </div>

                            </div>

                            ))}

                          </div>

                        </ul>
                      </div>
                    </div>
                  </div>
                  : null}
                <div className="card">
                  <div className="card-header p-0" style={{ backgroundColor: "#009141" }} id="headingOne">
                    <h5 className="mb-0">
                      <button className="btn btn-link" data-toggle="collapse" data-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                        <h5 style={{ color: "white" }}><FaClipboardCheck className="mb-2" /> {" "}  Détails produit </h5>  </button>

                    </h5>
                  </div>

                  <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
                    <div className="card-body">
                      <div className="row">
                        {commandes.espece.map((esp) =>
                          <div className="col-lg-6  col-sm-6 mb-4">

                            <div className="row">
                              <div className="col-lg-6  col-sm-6 pr-0 border-0" style={{ height: "220px" }}>

                                <div className="product__item">
                                  <div
                                    className="product__item__pic set-bg"
                                    style={esp.anoc !== null ? { height: "193px" } : { height: 220 }}
                                    data-setbg={esp.images}
                                  >

                                    <img
                                      src={esp.image_face}
                                      style={esp.anoc !== null ? { height: "193px" } : { height: "220px" }}
                                      className="product__item__pic set-bg"
                                    />

                                    <ul className="product__item__pic__hover">

                                      <li>
                                        <Link to={`/DetailsMouton/${esp._id}`}>
                                          <a href="#">
                                            <i className="fa fa-eye"></i>
                                          </a>
                                        </Link>
                                      </li>
                                      {commandes.statut === "en attente de paiement avance" || commandes.statut === "en attente de validation avance" || commandes.statut === "en attente de paiement du reste" ?
                                        <li>
                                          <a type="button" onClick={this.handelDeleteEspece.bind(this, esp)}>
                                            <i className="fa fa-trash"></i>
                                          </a>
                                        </li>
                                        : null}
                                    </ul>
                                  </div>
                                  {esp.anoc ?
                                    <h1 style={{ borderRadius: "0% 0% 0% 40%", fontSize: "14px" }} className=" badge badge-success py-1 w-100  ">
                                      <HiOutlineBadgeCheck className=" mr-1 fa-lg " />
                                      <span>Labélisé ANOC</span>  </h1>
                                    :
                                    <span className="badge pt-3 w-100  mt-1  ">{"  "}</span>}

                                </div>

                              </div>
                              <div className="col-lg-6  col-sm-6 border" style={{ height: "220px", backgroundRepeat: "no-repeat", backgroundImage: esp.statut === "produit avarié" ? "linear-gradient(rgb(255,153,153), rgb(255,204,204))" : null, backgroundSize: "cover" }}>
                                <div className="product__item__text p-2 text-justify">
                                  <h6 className=""><b>№ Boucle</b> : {esp.boucle}</h6>
                                  <h6 className=""><b>Categorie</b> : {esp.categorie}</h6>
                                  <h6 className=""><b>Race :</b> {esp.race}</h6>
                                  <h6 className=""><b>Poids : </b>{esp.poids} Kg</h6>
                                  <h6 className=""><b>Age :</b> {esp.age} mois</h6>
                                  <h6 className=""><b>Localisation :</b> {esp.localisation}</h6>


                                  <h5 className=" text-danger mt-4">
                                    <i className="fa fa-usd" aria-hidden="true"></i>
                                    {" "}
                                    {esp.prix + "  Dhs"}
                                  </h5>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}

                      </div>




                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header p-0" style={{ backgroundColor: "#009141" }} id="headingTwo">
                    <h5 className="mb-0">
                      <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        <h5 style={{ color: "white" }}><FaClipboardCheck className="mb-2" /> {" "}  Détails livraison </h5>  </button>
                    </h5>
                  </div>
                  <div className="">
                    <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
                      <div className="card-body">
                        <div id="centrer" className="col-lg-12 col-md-6">
                          <div className="shoping__checkout mt-2 pb-0">
                            <ul>
                              <li>
                                <i className="fa fa-calendar-o" aria-hidden="true"></i>
                                {" "}Date de livraison :<b style={{ fontWeight: "normal" }}>{" "}{commandes.date_de_livraison.replace(/-/g, " / ")} </b>
                              </li>
                              <li>
                                <i className="fa fa-map-o" aria-hidden="true"></i>
                                {" "}Ville de livraison : <b style={{ fontWeight: "normal" }}>{" " + commandes.ville_livraison}</b>  </li>
                              <li>
                                <i className="fa fa-map-marker" aria-hidden="true"></i>
                                {" "}Adresse de livraison : <b style={{ fontWeight: "normal" }}>{commandes.adresse_domicile ? commandes.adresse_domicile : commandes.point_relais}</b>  </li>
                            </ul>
                          </div>
                          <br></br>





                        </div>
                      </div></div></div>
                </div>
                <div className="card">
                  <div className="card-header p-0" style={{ backgroundColor: "#009141" }} id="headingThree">
                    <h5 className="mb-0">
                      <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">

                        <h5 style={{ color: "white" }}><FaClipboardCheck className="mb-2" /> {" "}  Détails prix</h5>  </button>

                    </h5>
                  </div>
                  <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#accordion">
                    <div className="card-body">
                      <div id="centrer" className="col-lg-12 col-md-6">
                        <div className="shoping__checkout mt-2 pb-0">
                          <br></br>
                          <div className="shoping__checkout mt-2 pb-0">
                            <ul>
                              <li>
                                Prix Net <span> {prix} Dhs</span>
                              </li>
                              <li style={{ borderBottomStyle: "dashed", borderColor: "black" }}>
                                Prix Transport <span> {prix_transport}  Dhs    </span>
                              </li>

                              <li>
                                Prix Total{" "}
                                <span>   {commandes.prix_total}Dhs</span>
                              </li>
                              {commandes.statut === "en attente de paiement avance" ?
                                <li className="text-danger">
                                  Avance a payer{" "}
                                  <span>   {commandes.avance}Dhs</span>
                                </li> : null}
                              {commandes.statut === "en attente de validation avance" ?
                                <li>
                                  Avance deja payee{" "}
                                  <span>   {commandes.avance}Dhs</span>
                                </li> : null}
                              {commandes.statut === "en attente de paiement du reste" ?
                                <>
                                  <li>
                                    Avance deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li>
                                  <li className="text-danger">
                                    Reste a payer{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li></> : null}

                              {commandes.statut === "en attente de validation reste" || commandes.statut === "validé" ?
                                <>
                                  <li>
                                    Avance deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li>
                                  <li>
                                    Reste deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li></> : null}
                              {commandes.statut === "en attente de paiement du complément" ?
                                <>
                                  <li>
                                    Avance deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li>
                                  <li>
                                    Reste deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li>
                                  <li className="text-danger">
                                    Complement a payer{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li></> : null}
                              {commandes.statut === "en attente de validation du complément" ?
                                <>
                                  <li>
                                    Avance deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li>
                                  <li>
                                    Reste deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li>
                                  <li>
                                    Complement deja payee{" "}
                                    <span>   {commandes.avance}Dhs</span>
                                  </li></> : null}
                              {commandes.statut === "validé" ?
                                <li className=" text-success">
                                  <i className="fa fa-exclamation-circle" aria-hidden="true"></i>
                                  {" "}  Commande validee
                         </li>
                                : null}


                            </ul>
                          </div>

                        </div>
                      </div></div>
                  </div>

                </div>{commandes.statut === "en attente de paiement avance" || commandes.statut === "en attente de validation avance" ||
                  commandes.statut === "en attente de paiement du reste" || commandes.statut === "en attente de validation reste" || commandes.statut === "validé"
                  || commandes.statut === "en attente de paiement du complément" || commandes.statut === "en attente de validation du complément" ?
                  <div className="card">
                    <div className="card-header p-0" style={{ backgroundColor: "#009141" }} id="headingfive">
                      <h5 className="mb-0">
                        <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapsefive" aria-expanded="false" aria-controls="collapsefive">
                          <h5 style={{ color: "white" }}><FaClipboardCheck className="mb-2" /> {" "}
                            {commandes.statut === "en attente de paiement avance" || commandes.statut === "en attente de validation avance" ? "Paiement des frais de resevation" : null}
                            {commandes.statut === "en attente de paiement du reste" || commandes.statut === "en attente de validation reste" || commandes.statut === "validé" ? "Paiement du reste du montant" : null}
                            {commandes.statut === "en attente de paiement du complément" || commandes.statut === "en attente de validation du complément" ? "Paiement du complément du montant" : null}
                          </h5>  </button>
                      </h5>
                    </div>
                    <div id="collapsefive" className="collapse" aria-labelledby="headingfive" data-parent="#accordion">
                      <div className="card-body">

                        <br></br>

                        <ul>


                          {commandes.statut === "en attente de paiement avance"
                          ||commandes.statut==="reçu avance refusé" ?
                            <div>

                              <h5>  <b>Frais de reservation (non remboursable) </b><small>{commandes.avance} {" Dhs"}</small></h5>
                              <br></br>
                              <div className="form-check">
                                <input checked={this.state.mode_paiement_choisi == "virement"} onChange={this.onChange} className="form-check-input" type="radio" name="mode_paiement_choisi" id="virement" value="virement" />
                                <label className="form-check-label" htmlFor="virement">
                                  <b> Virement bancaire</b>
                                </label>
                              </div>
                              <p>pour payer les frais de reservation, il vous suffit d'effectuer un virement sur le RIB suivant
                          <span className="text-danger">{" " + this.state.cooperative_rib}</span></p>
                              <div className="form-check mt-2">
                                <input checked={this.state.mode_paiement_choisi == "transfert"} onChange={this.onChange} className="form-check-input" type="radio" name="mode_paiement_choisi" id="transfert" value="transfert" />
                                <label className="form-check-label" htmlFor="transfert">
                                  <b>Par agence de transfert d'argent (*)</b>
                                </label>
                              </div>

                              <span><small>* les frais de transfert sont a la charge de l'achteur</small></span>
                              <p>
                                pour payer les frais de reservation, il vous suffit d'effectuer un transfert d'argent à l'eleveur suivant
                       {<span className="text-danger">{" " + this.state.tech}</span>}
                              </p>
                              <br></br>
                              <p className="text-danger"><b>Attention :</b><br></br>
                        Vous avez jusqu'au {" " + commandes.deadline + " "} pour nous transmettre la copie (scan / photo) de l'ordre de virement ou de transfert .Au-delà de ce delai, votre commande sera annulee.</p>

                            </div> : null}
                          {commandes.statut === "en attente de validation avance" ?
                            <div>
                              <b>Validation en cours</b> {commandes.avance + " Dhs"}
                              <p className="text-danger">Votre reçu a bien ete receptionne. Il sera verifie dans les plus brefs delais. Des reception du virement, votre produit sera reserve</p>
                              <br></br>
                              <br></br>
                              <br></br>
                              <div className="row ">
                                <div className="col">{" "}</div>
                                <div className="col">   <div className="product__details__pic">
                                  <div className="product__details__pic__item">
                                    <img
                                      className="product__details__pic__item--large"
                                      src={commandes.reçu_avance}
                                      alt=""
                                    />
                                  </div>
                                </div></div>
                                <div className="col">{" "}</div>
                              </div>
                            </div> : null}
                          {commandes.statut === "en attente de paiement du reste"
                           ||commandes.statut==="reçu reste refusé" ?
                            <div>
                              <b>Reste du montant : {commandes.reste + "Dhs"}</b>
                            </div> : null}

                          {commandes.statut === "en attente de validation reste" ?
                            <div>
                              <b>Validation en cours</b> {commandes.reste + " Dhs"}
                              <p className="text-danger">Votre reçu a bien ete receptionne. Il sera verifie dans les plus brefs delais. Des reception du virement, nous vous contacterons pour la livraison</p>
                              <br></br>
                              <br></br>
                              <br></br>
                              <div className="row ">
                                <div className="col">{" "}</div>
                                <div className="col">   <div className="product__details__pic">
                                  <div className="product__details__pic__item">
                                    <img
                                      className="product__details__pic__item--large"
                                      src={commandes.reçu_montant_restant}
                                      alt=""
                                    />
                                  </div>
                                </div></div>
                                <div className="col">{" "}</div>
                              </div>
                            </div> : null}
                          {commandes.statut === "en attente de paiement du complément" ?
                            <div>
                              <b>Complément du montant : {commandes.complement + "Dhs"}</b>
                            </div> : null}
                          {commandes.statut === "en attente de validation du complément" ?
                            <div>
                              <b>Validation en cours</b> {commandes.complement + " Dhs"}
                              <p className="text-danger">Votre reçu a bien ete receptionne. Il sera verifie dans les plus brefs delais. Des reception du virement, nous vous contacterons pour la livraison</p>
                              <br></br>
                              <br></br>
                              <br></br>
                              <div className="row ">
                                <div className="col">{" "}</div>
                                <div className="col">   <div className="product__details__pic">
                                  <div className="product__details__pic__item">
                                    <img
                                      className="product__details__pic__item--large"
                                      src={commandes.reçu_montant_complement}
                                      alt="reçu_montant_complement"
                                    />
                                  </div>
                                </div></div>
                                <div className="col">{" "}</div>
                              </div>
                            </div> : null}
                          {commandes.statut === "validé" ?
                            <div>
                              <p className="text-danger">Votre virement est valide. la livraison est prevu le {commandes.date_de_livraison} . Nous vous contacterons par telephone  pour preciser l'heure exacte</p>
                              <br></br>
                              <br></br>
                              <br></br>
                              <div className="row ">
                                <div className="col">{" "}</div>
                                <div className="col">   <div className="product__details__pic">
                                  <div className="product__details__pic__item">
                                    {commandes.reçu_montant_complement == null || commandes.reçu_montant_complement == undefined ?
                                      <img
                                        className="product__details__pic__item--large"
                                        src={commandes.reçu_montant_restant}
                                        alt="reçu_montant_restant"
                                      /> :
                                      <img
                                        className="product__details__pic__item--large"
                                        src={commandes.reçu_montant_complement}
                                        alt="reçu_montant_complement"
                                      />}

                                  </div>
                                </div></div>
                                <div className="col">{" "}</div>
                              </div>
                            </div>
                            : null}

                        </ul>
                      </div>
                    </div>
                  </div>

                  : null}
                {commandes.statut !== "avarié" && commandes.statut !== "en attente de paiement avance" && commandes.statut !== "en attente de validation avance" &&
                  commandes.statut !== "en attente de paiement du reste" && commandes.statut !== "en attente de validation reste" && commandes.statut !== "validé" &&
                  commandes.statut !== "en attente de paiement du complément" && commandes.statut !== "en attente de validation du complément" ?
                  <div className="card">
                    <div className="card-header p-0" style={{ backgroundColor: "#009141" }} id="headingfour">
                      <h5 className="mb-0">
                        <button className="btn btn-link collapsed" data-toggle="collapse" data-target="#collapsefour" aria-expanded="true" aria-controls="collapsefour">
                          <h5 style={{ color: "white" }}><FaClipboardCheck className="mb-2" /> {" "}Motif de l'annulation
                      </h5>  </button>
                      </h5>
                    </div>
                    <div id="collapsefour" className="collapse" aria-labelledby="headingfour" data-parent="#accordion">
                      <div className="card-body">

                        <br></br>

                        <ul>   <div>
                          <p className="text-danger">{commandes.statut}</p>
                          <p><b>Pour toute reclamation, contactez le service client au 0601120156. Disponible de 9h à  19h sauf Samedi et Dimanche </b></p>
                        </div>
                        </ul>
                      </div>
                    </div>
                  </div>
                  : null}
              </div>
            </div>
            <br></br><br></br>
            <div className="my-5">
              <div className="row">
                <div className="col-md-4 offset-md-4">

                  {commandes.statut === "en attente de paiement avance"||commandes.statut==="reçu avance refusé" ?
                    <button style={{ fontSize: "19px" }} id="centre" onClick={this.Modal.bind(this, "avance")}
                      className="btn-success py-1 px-4 mb-3 w-75" ><BsFileEarmarkPlus className="fa-lg" /> {" "}
                        Payer l'avance{" "}
                    </button> : null}
                  {commandes.statut === "en attente de paiement du reste" ||commandes.statut==="reçu reste refusé"?
                    <button style={{ fontSize: "19px" }} id="centre" onClick={this.Modal.bind(this, "reste")}
                      className="btn-success py-1 px-4 mb-3 w-75" ><BsFileEarmarkPlus className="fa-lg" /> {" "}
                        Payer le reste{" "}
                    </button> : null}
                  {commandes.statut === "en attente de paiement du complément" ?
                    <button style={{ fontSize: "19px" }} id="centre" onClick={this.Modal.bind(this, "complement")}
                      className="btn-success py-1 px-4 mb-3 w-75" > <BsFileEarmarkPlus className="fa-lg" />{" "}
                        Payer le complement{" "}
                    </button> : null}


                </div>
                <div className="col-md-3 offset-md-3">{" "}</div>
              </div>
              <div className="row mb-5">
                <div className="col-md-4 offset-md-4 ">
                  <button style={{ fontSize: "19px" }}
                    id="centre"
                    className="btn-danger py-1 px-4 mb-3 w-75"
                    onClick={this.handelDelete}
                  >  <BiTrash className="fa-lg" />{" "}Annuler la commande{" "}
                  </button></div>
                <div className="col-md-3 offset-md-3">{" "}</div>
                <div className="col-md-3 offset-md-3">{" "}</div>
              </div>
            </div>
          </div>
          {/**modal de changement*/}
          <Modal
            size= {this.state.Especes[2] !== undefined&& this.state.Especes[2].length==1?null:"xl"} 
            show={this.state.showSolution}
            onHide={this.Hide}
            backdrop="static"
            keyboard={false}>
            <Modal.Header closeButton>
              <Modal.Title>
                <h4>Solutions proposées</h4>
               
              </Modal.Title>
            </Modal.Header>
             <Modal.Body className="overflow-auto" style={this.state.showRemb == false ?
             this.state.Especes[2] !== undefined&& this.state.Especes[2].length==1?
              { maxHeight: "max-content",margin:"auto" }
              :{height: "620px" }
              :{ maxHeight: "max-content",minWidth:"600px"}
              }>

              {this.state.Especes[2] !== undefined 
              &&this.state.showRemb == false ?
                <>  <div className={ this.state.Especes[2].length==1?null:"row"}>
                  {this.state.Especes[2].map((Annonces) =>
                  (
                    
                    <div style={ this.state.Especes[2].length==1?{maxWidth:"max-content"}:null}className={ this.state.Especes[2].length==1?null:"col-lg-3  col-sm-6"}>

                      <div id="anonce" className="product__item">
                        <div
                          className="product__item__pic set-bg"
                          data-setbg={Annonces.images} >
                          <img
                            src={Annonces.image_face}
                            className="product__item__pic set-bg"
                          />

                          <ul className="product__item__pic__hover">
                            <li>
                              <Link to={`/DetailsMouton/${Annonces._id}`}>
                                <a href="#">
                                  <i className="fa fa-eye"></i>
                                </a>
                              </Link>
                            </li>
                          </ul>
                        </div>
                        {Annonces.anoc ?
                          <h1 style={{ borderRadius: "0% 0% 0% 40%", fontSize: "14px" }} className=" badge badge-success py-1 w-100  ">
                            <HiOutlineBadgeCheck className=" mr-1 fa-lg " />
                            <span>Labélisé ANOC</span>  </h1>
                          :
                          <span className="badge pt-3 w-100  mt-1  ">{"  "}</span>
                        }
                        <div className="product__item__text p-2 text-justify">
                          <h6 className=""><b>Categorie</b> : {Annonces.categorie}</h6>
                          <h6 className=""><b>Race :</b> {Annonces.race}</h6>
                          <h6 className=""><b>Poids : </b>{Annonces.poids} Kg</h6>
                          <h6 className=""><b>Age :</b> {Annonces.age} mois</h6>
                          {this.state.Especes[0].prix - Annonces.prix > 0 ?
                            <h5 className=" text-success text-center mt-4  ">

                              - {" "}

                              {this.state.Especes[0].prix - Annonces.prix + "  Dhs"}
                            </h5> :
                            <h5 className=" text-danger text-center mt-4 ">

                              + {" "}

                              {Annonces.prix - this.state.Especes[0].prix + "  Dhs"}
                            </h5>}

                          {this.state.Especes[2].length > 1 ? <div className="row mt-3">
                            <div className="col-3">{" "}</div>
                            <button type="button" onClick={this.AccepteSoution.bind(this, Annonces)} className="col-6 py-1 btn btn-success">Accepter</button>
                            <div className="col-3">{" "}</div>
                          </div> : null}
                          {this.state.Especes[2].length == 1 ?
                            <div className="row mt-3">
                              <div className="col-1">{" "}</div>
                              <button type="button" onClick={this.AccepteSoution.bind(this, Annonces)} className="col-4 py-1 btn btn-success">Accepter</button>
                              <div className="col-1">{" "}</div>
                              <button onClick={this.RefuseTSoutions} type="button" className="col-4 py-1 btn btn-danger">Refuser</button>
                              <div className="col-2">{" "}</div>
                            </div> : null}


                        </div> </div>

                    </div>

                  ))}
                </div>
                  {this.state.Especes[2].length > 1 ?
                    <div className="row mt-1">
                      <div className="col-4">{" "}</div>
                      <button type="button" onClick={this.RefuseTSoutions} className="col-4 py-1 btn btn-danger">Refuser les solutions proposées</button>
                      <div className="col-4">{" "}</div>
                    </div> : null}
                </> : (this.state.showRemb == true ? <div>

                  {this.state.commandes.especes.filter((f) => f.id_espece == this.state.especeAv._id)[0].produits_changement.length == 0 ?
                    <h4 className="text-danger mb-5 mt-2"> Pas de produits de changements proposés.</h4>
                    :
                    <h4 className="text-danger mb-5 mt-2"> Vous avez refuse tous les produits de changements proposés.</h4>
                  }
                  {this.state.commandes.ancien_statut !== "en attente de paiement avance" ?
                    <>
                      <h5>Dans ce cas là, nous procederons à  votre remboursement : <span className="text-danger">{this.state.prixRemb} Dhs</span></h5>
                      <form className="my-5 ">
                        <div className="form-group">
                          <label htmlFor="nom_prenom">Votre nom et prenom</label>
                          <input onChange={this.onChange} type="text" className="form-control" id="nom_prenom" name="nom_prenom" placeholder="Nom et prenom" />
                          <span className="text-danger">{this.state.errors["nom_prenom"]}</span>
                        </div>
                        <div className="form-group">
                          <label htmlFor="rib">Votre numero de RIB</label>
                          <input onChange={this.onChange} type="text" className="form-control" id="rib" name="rib" placeholder="RIB" />
                          <span className="text-danger">{this.state.errors["rib"]}</span>
                        </div>
                      </form>
                      <br></br>
                      <br></br>
                      <div className="row mt-2">
                        <div className="col-3">{" "}</div>
                        <button type="button" onClick={this.ModalS.bind(this, this.state.especeAv)} className="btn btn-danger col-2">Annuler </button>
                        <div className="col-2">{" "}</div>
                        <button type="button" onClick={this.handlPost} className="btn btn-success col-2">Valider</button>
                        <div className="col-3">{" "}</div>
                      </div>

                    </> :( <h5>Dans ce cas là, l'ennonce sera annulee </h5>)
                  }
                </div> :
                  null
                )}
            </Modal.Body>


          </Modal>


          {/**modal de changement*/}
               {/**modal choix*/}
               <Modal
            size="lg"
            show={this.state.showChoix}
            onHide={this.Hide}
            backdrop="static"
            keyboard={false}>
            <Modal.Header closeButton>
              <Modal.Title>
                <h4>Solution choisi</h4>
               
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="overflow-auto" style={{  maxHeight: "max-content"}}>

            {this.state.Especes[2] !== undefined && 
    this.state.showChoix== true  ?<div>
 {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).etat.statut==="avarié_changement"
||(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).etat.statut==="en attente de paiement du complement"
?
<div>
<h4 className="text-danger mb-5 mt-2"> Vous avez choisi l'espece suivante :</h4>
<div class="row">
 
<div class="col">
<div
                                  className="product__item__pic set-bg"
                                  data-setbg={(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.images}
                                >
                                  <img
                                    src={(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.image_face}
                                    className="product__item__pic set-bg"
                                  />


                                </div>
                                {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.anoc ?
                                  <h1 style={{ borderRadius: "0% 0% 0% 40%", fontSize: "14px" }} className=" badge badge-success py-1 w-100  ">
                                    <HiOutlineBadgeCheck className=" mr-1 fa-lg " />
                                    <span>Labélisé ANOC</span>  </h1>
                                  :
                                  <span className="badge pt-3 w-100  mt-1  " >{"  "}</span>
                                }
</div>

<div class="col">

                                <div className="product__item__text p-2 text-justify"
                                >
                                  <h6 className=""><b>№ Boucle</b> : {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.boucle}</h6>
                                  <h6 className=""><b>Categorie</b> : {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.categorie}</h6>
                                  <h6 className=""><b>Race :</b> {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.race}</h6>
                                  <h6 className=""><b>Poids : </b>{(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.poids} Kg</h6>
                                  <h6 className=""><b>Age :</b> {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.age} mois</h6>
                                  <h6 className=""><b>Localisation :</b> {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.localisation}</h6>
                                  <h5 className=" text-danger  ">
                                    <i className="fa fa-usd" aria-hidden="true"></i>
                                    {" "}
                                    {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).choix.prix + "  Dhs"}
                                  </h5>
                                  
                                </div>
</div>

</div>
 
 {this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0].etat.complement!=0?
 <>
<h4 className="text-danger mb-5 mt-2"> Complement : {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).etat.complement +" Dhs"}</h4>
</>:null}
{this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0].etat.montant_de_remboursement!=0?
<><h4 className="text-danger mb-5 mt-2"> remboursement : {(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).etat.montant_de_remboursement +" Dhs"}</h4>
  </>:null}
  </div>
:
null}
{(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).etat.statut==="avarié_remboursement"?

<div>
<h4 className="text-danger mb-5 mt-2"> remboursement :{(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).etat.montant_de_remboursement +" Dhs"}</h4>

</div>
:
null}
{(this.state.especesAv.filter((e) => e.id == this.state.especeAv._id)[0]).etat.statut==="avarié_annulée"?
<>
<h4 className="text-danger mb-5 mt-2"> Vous avez refuse tous les produits de changements proposés.</h4>
<h5>Dans ce cas là, l'ennonce sera annulee </h5>
</>
:
null}
 
    </div>
      :null
}
       </Modal.Body>


          </Modal>


          {/**modal choix*/}
          {/**modal de paiement*/}
          <Modal
            size="lg"
            show={this.state.showAvance}
            onHide={this.Modal}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {this.state.payer === "avance" ? <h4>Importer le reçu : paiement d'avance</h4> : null}
                {this.state.payer === "reste" ? <h4>Importer le reçu : paiement du reste</h4> : null}
                {this.state.payer === "complement" ? <h4>Importer le reçu : paiement du complement</h4> : null} </Modal.Title>
            </Modal.Header>
            <Modal.Body>

              <div className="col-lg-12 col-md-12">


                <br></br>

                <div id="centreT">
                  <input
                    id="selectedFile"
                    style={{ display: "none" }}
                    type="file"
                    name="recuAvance"
                    onChange={this.handleChangeImage}
                    encType="multipart/form-data"
                    required
                  />
                  <br />
                </div>
                <br />

                <label htmlFor="selectedFile" className="product__details__pic__item w-100">
                  {this.state.dataUrl ?
                    <img
                      id="img-background"

                      className="product__details__pic__item--large"
                      src={this.state.dataUrl}
                    /> : <img
                      id="img-background"

                      className="product__details__pic__item--large"

                    />}
                </label>

                <br />
                <br />
              </div>
            </Modal.Body>
            <Modal.Footer>

              <button type="button" onClick={this.Modal} className="btn btn-danger">Annuler </button>
              <button type="button" onClick={this.handlePut} className="btn btn-success">Valider</button>
            </Modal.Footer>
          </Modal>




          {/**modal  de paiement*/}
        </div>
      </React.Fragment>

    );
  }
}

export default DetailsCommande;
