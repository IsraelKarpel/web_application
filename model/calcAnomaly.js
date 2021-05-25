const ss = require('simple-statistics');
const enclosingCircle = require('smallest-enclosing-circle');

function dataToArrayOfColumns(data) {
    data_arr = []
    var array = data.split('\r\n')
    const num_of_columns = array[0].split(',').length
    for (let j = 0; j<num_of_columns; j++) {
        arr_per_column = []
        for (let i = 0; i<array.length-1; i++) {
            inner_array = array[i].split(',')
            arr_per_column.push(inner_array[j])
        }
        data_arr.push(arr_per_column)
    }
    return data_arr
}

function getKeyNames(arr_of_columns) {
    key_names = []
    for (line in arr_of_columns) {
        key_names.push(arr_of_columns[line][0])
    }
    return key_names
}

function getValues(arr_of_columns) {
    values = []
    for (line in arr_of_columns) {
        value_raw = arr_of_columns[line].slice(1)
        for (i in value_raw) {
            value_raw[i] = parseInt(value_raw[i])
        }
        values.push(value_raw)
    }
    return values
}

function bestColleratePairsAccordingToPearson(arr_of_columns) {
    var colerraions_table = {};
    var key_names = getKeyNames(arr_of_columns)
    var values = getValues(arr_of_columns)
    for (i = 0; i < key_names.length; i++) {
        best_correlates_value = 0
        best_correlates_attribute = 0
        for (j = 0; j < key_names.length; j++) {
            if (i != j) {
                corl = ss.sampleCorrelation(values[i], values[j]).toFixed(4);
                if (corl < 0) {
                    corl = corl * -1;
                }
                if (corl > best_correlates_value) {
                best_correlates_value = corl;
                best_correlates_attribute = key_names[j];
                best_correlates_number = j
                }
            }
        }
        colerraions_table[key_names[i]] = new Array();
        colerraions_table[key_names[i]].push(best_correlates_attribute);
        colerraions_table[key_names[i]].push(best_correlates_number);
        colerraions_table[key_names[i]].push(best_correlates_value);
    }
    return colerraions_table
}

function GetLinearRegressionParam(arr_of_columns, best_correlates){
    key_names = getKeyNames(arr_of_columns)
    values = getValues(arr_of_columns)
    //console.log(values)
    linear_regression_param = {};
    for (i = 0; i < key_names.length; i++) {
        //change the input into [x,y] format
        correctd_input_form = changeInputFormat(key_names, values, best_correlates, i);
        //console.log(correctd_input_form)
        var l = ss.linearRegression(correctd_input_form);
        //compute farest distance from line
        max_distance = FarestDistanceFromLine(key_names, values, l, i, best_correlates);
        linear_regression_param[key_names[i]] = new Array();
        //linear_regression_param[key_names[i]].push("linear_regression");
        linear_regression_param[key_names[i]].push(l["m"]);
        linear_regression_param[key_names[i]].push(l["b"]);
        linear_regression_param[key_names[i]].push(max_distance);
        linear_regression_param[key_names[i]].push("regression");

    }
    return linear_regression_param;
}

function changeInputFormat(key_names, values, best_correlates, i) {
    var values_for_linear = new Array(values.length);
    for (j = 0; j < values[0].length; j++ ) {
        num = best_correlates[key_names[i]][1]
        a = [values[i][j], values[num][j]];
        values_for_linear[j] = a
    }
    return values_for_linear;
}

function FarestDistanceFromLine(key_names, values, l, i, best_correlates) {
    max_distance = 0;
    for (j = 0 ; j < values[0].length; j++) {
        //according to |(m*x0 -y0 + n) / sqrt(m^2 + 1)|
        num = best_correlates[key_names[i]][1]
        distance_up = (l["m"] * values[i][j]) - values[num][j] + l["b"];
        distance_down = Math.sqrt((l["m"] * l["m"]) + 1);
        final_distance = Math.abs(distance_up / distance_down);
        if (final_distance > max_distance) {
            max_distance = final_distance;
        }
    }
    return max_distance;
}

function getHybridRegressionParam(arr_of_columns, best_correlates) {
    var threshold = 0.9;
    key_names = getKeyNames(arr_of_columns);
    values = getValues(arr_of_columns)
    hybrid_param = {};
    for (i = 0; i < key_names.length; i++) {    
        //change the input into [x,y] format
        correctd_input_form = changeInputFormat(key_names, values, best_correlates, i);
        if (best_correlates[key_names[i]][2] < threshold) {
            var l = ss.linearRegression(correctd_input_form);
            //compute farest distance from line
            max_distance = FarestDistanceFromLine(key_names, values, l, i, best_correlates);
            hybrid_param[key_names[i]] = new Array();
            hybrid_param[key_names[i]].push(l["m"]);
            hybrid_param[key_names[i]].push(l["b"]);
            hybrid_param[key_names[i]].push(max_distance);
            hybrid_param[key_names[i]].push("regression");
        } else {
            //change the input wat s it will fit the enclosing circle format
            dict = []
            for (j = 0; j < correctd_input_form.length; j++) {
                dict.push({
                    x : correctd_input_form[j][0],
                    y : correctd_input_form[j][1]
                });
            }
            var s = enclosingCircle(dict)
            hybrid_param[key_names[i]] = new Array();
            hybrid_param[key_names[i]].push(s["x"]);
            hybrid_param[key_names[i]].push(s["y"]);
            hybrid_param[key_names[i]].push(s["r"]);
            hybrid_param[key_names[i]].push("ciycle");
        }
     }
    return(hybrid_param);
}

function GetAnomalies(check_file_as_columns, colleration_table, linear_regression_param) {
    anomalies = {}
    key_names = getKeyNames(check_file_as_columns);
    values = getValues(check_file_as_columns)
    for (let i = 0; i < key_names.length; i++) {
        collerate_index = colleration_table[key_names[i]][1]
        anomally_alogorithm = linear_regression_param[key_names[i]][3]
        if (anomally_alogorithm == "regression") {
        anomaly = computeAnomalyRegression(values[i], values[collerate_index], linear_regression_param[key_names[i]])
        anomalies[key_names[i]] = anomaly
        } else {
        anomaly = computeAnomalyCycle(values[i], values[collerate_index], linear_regression_param[key_names[i]])
        anomalies[key_names[i]] = anomaly
        }
    }
    //console.log(anomalies)
    const anomalies_as_json = JSON.stringify(anomalies)
    return anomalies_as_json
}

function computeAnomalyRegression(current_values, collerate_values, linear_regression_param){
    arr = []
    dummy = []
    m = linear_regression_param[0]
    n = linear_regression_param[1]
    max_distance = linear_regression_param[2]
    for (let i = 0; i < current_values.length; i++) {
        distance_up = (m * current_values[i]) - collerate_values[i] + n;
        distance_down = Math.sqrt((m * m) + 1);
        final_distance = Math.abs(distance_up / distance_down);
        if (final_distance > max_distance) {
            //for (let j = 0; j < dummy.length; j++) {
              //  if (dummy[j] == (i-1)) {
                //    for (let k = 0; k < dummy.length; k++) {
                  //      if (dummy[k] == (i-2)) {
                    //        arr.pop()
                  //      }
                //    }
              //  }
            //}
            arr.push(i)
        }
            //dummy.push(i)
        //} else {
           // for (let j = 0; j < dummy.length; j++) {
                //if (dummy[j] == (i-1)) {
                  //  for (let j = 0; j < dummy.length; j++) {
                    //    if (dummy[j] == (i-2)) {
                      //      let second = arr.pop()
                        //    let first =arr.pop()
                          //  arr.push([first,second]);
                       // }
                    //}
                //}
            //}
       // }///
   // }
   // for (let j = 0; j < dummy.length; j++) {
     //   if (dummy[j] == (collerate_values.length - 2)) {
       //     let second = arr.pop()
         //   let first =arr.pop()
           // arr.push([first,second]);
        //}
    //}
    }
    return arr;
}

function computeAnomalyCycle(current_values, collerate_values, linear_regression_param){
    arr = []
    dummy = []
    x = linear_regression_param[0]
    y = linear_regression_param[1]
    r = linear_regression_param[2]
    for (let i = 0; i < current_values.length; i++) {
        x_values = Math.pow(current_values[i] - x, 2)
        y_values = Math.pow(collerate_values[i] - x, 2)
        dot_distances = Math.sqrt(x_values + y_values);
        if (dot_distances > r) {
          //  for (let j = 0; j < dummy.length; j++) {
            //    if (dummy[j] == (i-1)) {
              //      for (let k = 0; k < dummy.length; k++) {
                //        if (dummy[k] == (i-2)) {
                  //          arr.pop()
                    //    }
                  //  }
               // }
           // }
            arr.push(i)
            //dummy.push(i)
        } //else {
            //for (let j = 0; j < dummy.length; j++) {
              //  if (dummy[j] == (i-1)) {
                //    for (let j = 0; j < dummy.length; j++) {
                  //      if (dummy[j] == (i-2)) {
                    //        let second = arr.pop()
                      //      let first =arr.pop()
                        //   arr.push([first,second]);
                        //}
                    //}
               // }
            //}
        //}
    //}
    //for (let j = 0; j < dummy.length; j++) {
      //  if (dummy[j] == (collerate_values.length - 2)) {
        //    let second = arr.pop()
          //  let first =arr.pop()
            //arr.push([first,second]);
        //}
    //}
    }
    return arr;
}

function calculateAnomaly(right_file_data, check_file_data, anomaly_chose ) {
    var right_file_as_columns = dataToArrayOfColumns(right_file_data)
    var check_file_as_columns = dataToArrayOfColumns(check_file_data)
    //get the best collerate of each cloumn
    var colleration_table = bestColleratePairsAccordingToPearson(right_file_as_columns)
    if (anomaly_chose == "regression") {
        //m, n, max_distance
        linear_regression_param = GetLinearRegressionParam(right_file_as_columns, colleration_table)
        var anomalies = GetAnomalies(check_file_as_columns, colleration_table, 
            linear_regression_param)
    }  
    if (anomaly_chose == "hybrid") {
        //x, y, r
        hybrid_regression_param = getHybridRegressionParam(right_file_as_columns, colleration_table)
        var anomalies = GetAnomalies(check_file_as_columns, colleration_table, 
            hybrid_regression_param)
    } 
    return anomalies 
}

function getColumnName(right_file_data) {
    var right_file_as_columns = dataToArrayOfColumns(right_file_data)
    var key_names = getKeyNames(right_file_as_columns)
    return key_names
}



module.exports.calculateAnomaly = calculateAnomaly
module.exports.getColumnName = getColumnName
//module.exports.getAnswerString = getAnswerString