(* Module body DTree *)

type dtree =
       Decision of string * int * dtree * string * int * dtree
    |  Chance of string * int * dtree * string * int * dtree
    |  Outcome of int
;;

let notFound = [-1];;

let myTree =
  Decision(
    "New Product", 0, 
      Decision(
        "Through Development", 150000,
          Chance(
            "good", 40,
              Outcome 1000000,
            "OTHER", 60,
              Chance(
                "moderate", 67,
                   Outcome 50000,
                "poor", 33,
                   Outcome 2000
              )
          ),
        "Rapid Development", 80000,
          Chance(
            "good", 10,
              Outcome 1000000,
            "OTHER", 90,
              Chance(
                "moderate", 22,
                  Outcome 50000,
                "poor", 78,
                  Outcome 2000
              )
          )
      ),
    "Consolidate", 0,
      Decision(
        "Strengthen Products", 30000,
          Chance(
            "good", 30,
              Outcome 400000,
            "OTHER", 70,
              Chance(
                "moderate", 57,
                  Outcome 20000,
                "poor", 43,
                  Outcome 6000
              )
          ),
        "Reap Products", 0,
          Chance(
            "good", 60,
              Outcome 20000,
            "poor", 40,
              Outcome 6000
          )
      )
  )
;;

let rec size dt =
    match dt with
      Decision(choiceL, costL, l, choiceR, costR, r) -> 1 + size l + size r
    | Chance(eventL, probL, l, eventR, probR, r) -> 1 + size l + size r
    | Outcome value -> 1
;;

let rec valid dt =
 match dt with
   Decision(choiceL, costL, l, choiceR, costR, r) -> if choiceL <> choiceR
      then true && valid l && valid r
      else false
 | Chance(eventL, probL, l, eventR, probR, r) -> if eventL = eventR
      then false else if probL + probR = 100
      then true && valid l && valid r
      else false
 | Outcome value -> true
;;

let rec count dt =
    match dt with
    | Decision(choiceL, costL, l, choiceR, costR, r) ->  
        let (dL, cL, oL) = count l and (dR, cR, oR) = count r in
            (dL+dR+1, cL+cR, oL+oR)
    | Chance(eventL, probL, l, eventR, probR, r) ->
        let (dL, cL, oL) = count l and (dR, cR, oR) = count r in
         (dL+dR, cL+cR+1, oL+oR)
    | Outcome value -> (0, 0, 1)
;;

let rec loadChannel ci =
    try
     let x = input_line ci in
        if x = "O" then
            let value = input_line ci in
            Outcome(int_of_string value)
            
        else if x = "D" then
            let choiceL = input_line ci in
                let costL = input_line ci in
                    let l = loadChannel ci in
                        let choiceR = input_line ci in
                            let costR = input_line ci in
                                let r = loadChannel ci in
                                    Decision(choiceL, int_of_string costL, l, choiceR, int_of_string costR, r)
        else if x = "C" then
            let eventL = input_line ci in
                let probL = input_line ci in
                    let l = loadChannel ci in
                        let eventR = input_line ci in
                            let probR = input_line ci in
                                let r = loadChannel ci in
                                    Chance(eventL, int_of_string probL, l, eventR, int_of_string probR, r)
        else
            raise (Arg.Bad "Caracter desconhecido")
    with End_of_file -> raise (Arg.Bad "loadChannel: invalid file")
;;

let rec storeChannel co t =
    match t with
          
    | Decision(choiceL, costL, l, choiceR, costR, r) ->
          output_string co "D"; output_string co "\n";
          output_string co (choiceL); output_string co "\n";
          output_string co (string_of_int costL); output_string co "\n";
          storeChannel co l;
          output_string co ( choiceR); output_string co "\n";
          output_string co (string_of_int costR); output_string co "\n";
          storeChannel co r
          
    | Chance(eventL, probL, l, eventR, probR, r) ->
          output_string co "C"; output_string co "\n";
          output_string co (eventL); output_string co "\n";
          output_string co (string_of_int probL); output_string co "\n";
          storeChannel co l;
          output_string co (eventR); output_string co "\n";
          output_string co (string_of_int probR); output_string co "\n";
          storeChannel co r
          
    | Outcome value -> 
        output_string co "O"; output_string co "\n";
        output_string co (string_of_int value); output_string co "\n"
;;

let rec sub dt coord =
 match dt, coord with
 |Decision(_, _, l, _, _, r), [] -> dt
 |Decision(_, _, l, _, _, r), x::xs -> if x = 0 then sub l xs
      else sub r xs
 |Chance(_, _, l, _, _, r), [] -> dt
 |Chance(_, _, l, _, _, r), x::xs -> if x = 0 then sub l xs
      else sub r xs
 |Outcome value, [] -> dt
 |Outcome value, x::xs -> raise(Arg.Bad"No tree");
;;

let rec find dt text =
    match dt with
        | Decision(choiceL, costL, l, choiceR, costR, r) ->
            
            if text = choiceL || text = choiceR then
                []
            
            else
                let xl = find l text in
                if(xl <> notFound) then
                    0::xl
                else
                    let xr = find r text in
                        if(xr <> notFound) then
                            1::xr
                        else
                            notFound
                
        | Chance(eventL, probL, l, eventR, probR, r) ->
            let xl = find l text and xr = find r text in
            
            if text = eventL then
            [0]
            else if text = eventR then
            [1]
            else 
                if(xl <> notFound) then
                    0::xl
                else
                        if(xr <> notFound) then
                            1::xr
                        else
                            notFound
        | Outcome value -> notFound
            
;;

let rec findAll dt text =
    []
;;

let rec edit dt coord nt =
    dt
;;

let rec benefit dt =
 match dt with
    | Decision(choiceL, costL, l, choiceR, costR, r) ->  
       let benR = (-costR + benefit r) and benL = (-costL + benefit l) in
       if benL > benR then
            benL
        else
            benR
    | Chance(eventL, probL, l, eventR, probR, r) ->
            (probL*benefit l + probR*benefit r)/100
    | Outcome value -> value
;;

let rec optimistic dt =
 match dt with
    | Decision(choiceL, costL, l, choiceR, costR, r) ->  
        let (gainL, coordL) = optimistic l and (gainR, coordR) = optimistic r in
            if (gainL-costL) > (gainR-costR) then
                (gainL-costL, 0::coordL) 
            else
                (gainR-costR, 1::coordR)
                
    | Chance(eventL, probL, l, eventR, probR, r) ->
        let (gainL, coordL) = optimistic l and (gainR, coordR) = optimistic r in
            if (gainL) > (gainR) then
                (gainL, 0::coordL) 
            else
                (gainR, 1::coordR)
    | Outcome value -> (value, [])
;;

let a =
    Decision("a", 0, Outcome 1, "b", 5, Chance("a", 90, Outcome 7, "b", 10, Outcome 6));;

let rec pessimistic dt =
 match dt with
    | Decision(choiceL, costL, l, choiceR, costR, r) ->  
        let (gainL, coordL) = pessimistic l and (gainR, coordR) = pessimistic r in
            if (gainL-costL) > (gainR-costR) then
                (gainR-costR, 1::coordR) 
            else
                (gainL-costL, 0::coordL)
                
    | Chance(eventL, probL, l, eventR, probR, r) ->
        let (gainL, coordL) = pessimistic l and (gainR, coordR) = pessimistic r in
            if (gainL) > (gainR) then
                (gainR, 1::coordR) 
            else
                (gainL, 0::coordL)
    | Outcome value -> (value, [])
;;

let rec probabilistic dt =
     match dt with
    | Decision(choiceL, costL, l, choiceR, costR, r) ->  
        let (gainL, coordL) = probabilistic l and (gainR, coordR) = probabilistic r in
            if (gainL-costL) > (gainR-costR) then
                (gainL-costL, 0::coordL) 
            else
                (gainR-costR, 1::coordR)
                
    | Chance(eventL, probL, l, eventR, probR, r) ->
        let (gainL, coordL) = probabilistic l and (gainR, coordR) = probabilistic r in
            if (probL) > (probR) then
                (gainL, 0::coordL) 
            else
                (gainR, 1::coordR)
    | Outcome value -> (value, [])
;;