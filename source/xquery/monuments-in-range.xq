xquery version "3.0";

import module namespace math ="http://exist-db.org/xquery/math"  at "org.exist.xquery.modules.math.MathModule";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";
declare option output:method "json";
declare option output:media-type "application/json";

let $latitude := number(request:get-parameter("latitude",()))
let $longitude := number(request:get-parameter("longitude",()))
let $range := number(request:get-parameter("range",2000))

let $longCorr := math:cos(math:radians($longitude))
return
  element items {
            for $item in doc("/db/apps/nearby/data/monuments.xml")/response/row/row
            let $alatitude := number($item/location_1/@latitude) 
            let $alongitude := number($item/location_1/@longitude) 
            let $dlat := ($latitude - $alatitude) * 60
            let $dlong := ($longitude - $alongitude) * 60 * $longCorr
            let $distance :=  math:sqrt(($dlat * $dlat) + ($dlong * $dlong))  * 1852 (: meters :)
            where $distance <= $range
            order by $distance
            return 
                 element item {
                       element id {$item/monument_record_no/string()},
                       element latitude {$alatitude},
                       element longitude {$alongitude},
                       element url {concat("/http:explorersolutions.co.uk/Nearby/monument/",$item/monument_record_no)},
                       element title  {concat($item/known_as," : ",$item/period_text)},
                       element description {$item/monument_desc/string()}
                 }
   }
      
