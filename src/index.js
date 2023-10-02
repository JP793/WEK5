import "./styles.css";

const fetchData = async () => {
  const url =
    "https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326";
  const res = await fetch(url);
  const data = await res.json();

  const url1 =
    "https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f";
  const res1 = await fetch(url1);
  const data1 = await res1.json();

  const url2 =
    "https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e";
  const res2 = await fetch(url2);
  const data2 = await res2.json();

  // console.log(data1);
  // console.log(data2);
  let positive_migration_city = data1.dataset.dimension.Tuloalue.category.label;
  let positive_migration_index =
    data1.dataset.dimension.Tuloalue.category.index;

  let negative_migration_city =
    data2.dataset.dimension.Lähtöalue.category.label;
  let negative_migration_index =
    data2.dataset.dimension.Lähtöalue.category.index;

  let positive_num = data1.dataset.value;
  let negative_num = data2.dataset.value;
  var dict_positive = {};
  var dict_negative = {};

  var final_dict_positive = {};
  var final_dict_negative = {};
  //positive
  for (let key in positive_migration_city) {
    dict_positive[positive_migration_city[key].split(" ")[2]] =
      positive_migration_index[key];
  }
  //negative
  for (let key1 in negative_migration_city) {
    dict_negative[negative_migration_city[key1].split(" ")[2]] =
      negative_migration_index[key1];
  }
  for (let index in dict_positive) {
    // console.log(dict_positive[index]);
    final_dict_positive[index] = positive_num[dict_positive[index]];
  }

  for (let index in dict_negative) {
    // console.log(dict_negative[index]);
    final_dict_negative[index] = negative_num[dict_negative[index]];
  }
  // console.log(positive_migration_index);
  // delete dict_positive["undefined"];
  // delete dict_negative["undefined"];
  // console.log(dict_negative);
  // console.log(final_dict_negative);
  // console.log(final_dict_positive);
  // delete final_dict_positive["undefined"];
  // delete final_dict_negative["undefined"];
  for (let i in data.features) {
    let city_name = data.features[i].properties.name;
    // console.log(city_name);

    data.features[i].properties["positi"] = final_dict_positive[city_name];
    data.features[i].properties["negati"] = final_dict_negative[city_name];
    // console.log(data.features[i].properties.positive_migration);
  }
  // console.log(data);
  initMap(data);
  // fillPath(data);
};

const initMap = (data) => {
  let map = L.map("map", {
    minZoom: -3
  });
  let geojson = L.geoJSON(data, {
    onEachFeature: getFeature,
    weight: 2,
    style: getStyle
  }).addTo(map);

  let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  map.fitBounds(geojson.getBounds());
};

const getFeature = (feature, layer) => {
  if (!feature.properties.name) return;
  layer.bindPopup(
    `<ul>
        <li>Name: ${feature.properties.name}</li>
        <li>Positive migration: ${feature.properties.positi}</li>
        <li>Negative migration: ${feature.properties.negati}</li>
    </ul>`
  );
  layer.bindTooltip(feature.properties.name);

  // layer.binPopup(
  //   `<ul>
  //     <li>Name: ${lutBuilding[id - 1].name}</li>
  //     <li>Year of construction: ${lutBuilding[id - 1].year}</li>
  //   </ul>`
  // );
  //
  return false;
};

// const counter = () => {
//   let count = 0;
//   for (let ob in objects.features) {
//     count += 1;
//   }
//   return count;
//}

const getStyle = (feature) => {
  const mapStyling = (x, y) => {
    let color = (x / y) * (x / y) * (x / y) * 60;
    // let color = Math.pow(m1 / m2, 3) * 60;
    if (color > 120) {
      color = 120;
    }
    return color;
  };
  // console.log(feature.properties);

  return {
    color:
      "hsl(" +
      mapStyling(feature.properties["positi"], feature.properties["negati"]) +
      ", 75%, 50%)"
  };
};
fetchData();
