xquery version "3.0";

import module namespace math ="http://exist-db.org/xquery/math"  at "org.exist.xquery.modules.math.MathModule";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare option output:method "json";
declare option output:media-type "application/json";

let $latitude := number(request:get-parameter("latitude",()))
let $longitude := number(request:get-parameter("longitude",()))
let $range := number(request:get-parameter("range",1000))

let $longCorr := math:cos(math:radians($longitude))
let $m-per-degree := 60 * 1852
let $range-degrees := $range div $m-per-degree
let $range2 := $range-degrees * $range-degrees
return
  element items {      
            for $item in doc("/db/apps/nearby/data/monuments.xml")/response/row/row
            let $alatitude := number($item/location_1/@latitude) 
            let $alongitude := number($item/location_1/@longitude) 
            let $dlat := ($latitude - $alatitude)
            let $dlong := ($longitude - $alongitude) * $longCorr
            let $distance2 :=  ($dlat * $dlat) + ($dlong * $dlong)
            where $distance2 <= $range2
            order by $distance2
            return 
                 element item {
                       element id {$item/monument_record_no/string()},
                       element latitude {$alatitude},
                       element longitude {$alongitude},
                       element title  {$item/known_as/string()},
                       element description {$item/monument_desc/string()},
                       element period {$item/period_text/string()}
                 }
   }
      
