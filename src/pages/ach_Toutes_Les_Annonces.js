import React, { Component } from "react";
import axios from "axios";
import Select from "react-select";
import { Link } from "react-router-dom";
class HomeSheeps extends Component {
  constructor() {
    super();
    // let redirect = false;
    this.state = {
      Annonces: [],
      selectedOptionRace: null,
      optionsRace: [
        { value: "Sardi", label: "Sardi" },
        { value: "Bargui", label: "Bargui" },
      ],

      selectedOptionVille: null,
      optionsVille: [
        { value: "Oujda", label: "Oujda" },
        { value: "Berkan", label: "Berkan" },
        { value: "Jrada", label: "Jrada" },
        { value: "CASABLANCA", label: "CASABLANCA" },
      ],
      conditions: {
        statut: "disponible",
        order_by: "race",
        order_mode: "asc",
      },
      redirect: false,
    };
    this.onChange = this.onChange.bind(this);
    this.handelChercher = this.handelChercher.bind(this);
    // this.handleFavoris=this.handleFavoris.bind(this)
  }

  handleChangeRace = (selectedOptionRace) => {
    this.setState({ selectedOptionRace }, () =>
      this.setState({
        conditions: Object.assign(this.state.conditions, {
          race: this.state.selectedOptionRace.value,
        }),
      })
    );
  };

  handleChangeVille = (selectedOptionVille) => {
    this.setState({ selectedOptionVille }, () =>
      this.setState({
        conditions: Object.assign(this.state.conditions, {
          localisation: this.state.selectedOptionVille.value,
        }),
      })
    );
  };

  componentDidMount() {
    // const token = localStorage.getItem("usertoken");
    // if (!token) {
    //   this.props.history.push("/login");
    // } else {
    //   console.log(token)
    axios
      .get("http://127.0.0.1:8000/api/mouton", {
        headers: {
          // "x-access-token": token, // the token is a variable which holds the token
          "Content-Type": "application/json",
        },
        params: {
          statut: "disponible",
          order_by: "race",
          order_mode: "asc",
        },
      })
      .then((res) => {
        this.setState({
          Annonces: res.data,
        });
      });
  }

  onChange(e) {
    const n = e.target.name,
      v = e.target.value;

    this.setState({
      conditions: Object.assign(this.state.conditions, { [n]: v }),
    });
  }

  handelChercher() {
    const token = localStorage.getItem("usertoken");
    if (!token) {
      this.props.history.push("/login");
    } else {
      console.log(token);
      axios
        .get("http://127.0.0.1:8000/api/mouton", {
          headers: {
            // "x-access-token": token, // the token is a variable which holds the token
            "Content-Type": "application/json",
          },
          params: this.state.conditions,
        })
        .then((res) => {
          this.setState({
            Annonces: res.data,
          });
        });
    }
  }

  // handleFavoris(Mid) {
  //   console.log(Mid);
  //   const token = localStorage.getItem("usertoken");
  //   if (!token) {
  //     this.props.history.push("/login");
  //   } else {
  //     // console.log(token);
  //     axios
  //       .put(
  //         "http://127.0.0.1:8000/api/consommateur/" + token + "/favoris",{ id_mouton: Mid }

  //        , {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }

  //       )
  //       .then((res) => {});
  //   }
  // }

  render() {
    const { selectedOptionRace } = this.state;
    const { optionsRace } = this.state;
    const { selectedOptionVille } = this.state;
    const { optionsVille } = this.state;
    return (
      <div>
        {/* <!-- Page Preloder --> */}
        {/* <div id="preloder">
          <div className="loader"></div>
        </div> */}

        <section className="product spad">
          <div className="container">
            <div className="row">
              <div className="col-lg-3 col-md-5">
                <div className="sidebar">
                  <div className="sidebar__item">
                    <h4>Rechercher</h4>

                    <h6 className="latest-product__item">Prix</h6>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <input
                          type="text"
                          className="latest-product__item"
                          placeholder="Budget min"
                          name="prix_min"
                          onChange={this.onChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <input
                          type="text"
                          className="latest-product__item"
                          placeholder="Budget max"
                          name="prix_max"
                          onChange={this.onChange}
                        />
                      </div>
                    </div>

                    <h6 className="latest-product__item">Race</h6>
                    <div className="row">
                      <div className="col-lg-9 col-md-9">
                        {/* <input
                          type="text"
                          className="latest-product__item"
                          placeholder="Choisissez la race"
                          onChange={this.onChange}
                          name="race"
                        /> */}
                        <Select
                          value={selectedOptionRace}
                          onChange={this.handleChangeRace}
                          options={optionsRace}
                          placeholder="Race"
                          required
                          // className="Select"
                        />
                        <br></br>
                      </div>
                    </div>

                    <h6 className="latest-product__item">Poids Environ</h6>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <input
                          type="text"
                          className="latest-product__item"
                          placeholder="Poids min"
                          name="poids_min"
                          onChange={this.onChange}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        <input
                          type="text"
                          className="latest-product__item"
                          placeholder="Poids max"
                          name="poids_max"
                          onChange={this.onChange}
                        />
                      </div>
                    </div>

                    <h6 className="latest-product__item">Ville</h6>
                    <div className="row">
                      <div className="col-lg-9 col-md-9">
                        <Select
                          value={selectedOptionVille}
                          onChange={this.handleChangeVille}
                          options={optionsVille}
                          placeholder="Ville"

                          // className="Select"
                        />
                        <br></br>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6 col-md-6">
                        {/* <button className="btn btn-success" onClick={this.handelChercher}> Rechercher </button><br/> */}
                        <button
                          className=" site-btn"
                          onClick={this.handelChercher}
                        >
                          {" "}
                          Rechercher{" "}
                        </button>
                      </div>
                    </div>

                    {/* <label className="latest-product__item">
                      <input name="withImages" type="checkbox" /> Avec photos
                    </label> */}

                    {/* <label className="latest-product__item">
                      <input name="withVideos" type="checkbox" /> Avec video
                    </label> */}
                  </div>
                </div>
              </div>

              <div className="col-lg-9 col-md-7">
                <div className="filter__item">
                  <div className="row">
                    <div className="col-lg-4 col-md-5"></div>
                    <div className="col-lg-12 col-md-12">
                      <div className="filter__found text-left">
                        <h6>
                          <span>{this.state.Annonces.length}</span> Moutons
                          disponibles à vendre
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>

                {/*<!-- Sheeps Grid Section Begin --> */}

                <div className="row">
                  {this.state.Annonces.map((Annonces) => (
                    <div className="col-lg-4 col-md-6 col-sm-6">
                      {console.log(Annonces.image_face)}
                      <div className="product__item">
                        <div
                          className="product__item__pic set-bg"
                          data-setbg={Annonces.images}
                          // src="Images/sardi1.jpg"
                        >
                          <img
                            src={Annonces.image_face}
                            // src=Annonces.images
                            className="product__item__pic set-bg"
                          />

                          <ul className="product__item__pic__hover">
                            {/* <li>
                              <a
                                id={Annonces._id}
                                onClick={(e) =>
                                  this.handleFavoris(e.currentTarget.id)
                                }
                              >
                                <i className="fa fa-heart"></i>
                              </a>
                            </li> */}
                            <li>
                              <Link to={`/DetailsMouton/${Annonces._id}`}>
                                <a href="#">
                                  <i class="fa fa-eye"></i>
                                </a>
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="product__item__text">
                          <h6>{"         " + Annonces.race}</h6>
                          <h6>{"         " + Annonces.poids + " Kg"}</h6>
                          <h6>{"         " + Annonces.age + " mois"}</h6>
                          <h5>{"         " + Annonces.prix + " MAD"}</h5>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* <!-- Sheeps Grid Section End --> */}

                {/* <div className="product__pagination">
                  <a href="#">1</a>
                  <a href="#">2</a>
                  <a href="#">3</a>
                  <a href="#">
                    <i className="fa fa-long-arrow-right"></i>
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default HomeSheeps;
