<template>
  <md-select v-model="form.country" autocomplete="country">
    <md-option value="AF">Afghanistan</md-option>
    <md-option value="AX">Åland Islands</md-option>
    <md-option value="AL">Albania</md-option>
    <md-option value="DZ">Algeria</md-option>
    <md-option value="AS">American Samoa</md-option>
    <md-option value="AD">Andorra</md-option>
    <md-option value="AO">Angola</md-option>
    <md-option value="AI">Anguilla</md-option>
    <md-option value="AQ">Antarctica</md-option>
    <md-option value="AG">Antigua and Barbuda</md-option>
    <md-option value="AR">Argentina</md-option>
    <md-option value="AM">Armenia</md-option>
    <md-option value="AW">Aruba</md-option>
    <md-option value="AU">Australia</md-option>
    <md-option value="AT">Austria</md-option>
    <md-option value="AZ">Azerbaijan</md-option>
    <md-option value="BS">Bahamas</md-option>
    <md-option value="BH">Bahrain</md-option>
    <md-option value="BD">Bangladesh</md-option>
    <md-option value="BB">Barbados</md-option>
    <md-option value="BY">Belarus</md-option>
    <md-option value="BE">Belgium</md-option>
    <md-option value="BZ">Belize</md-option>
    <md-option value="BJ">Benin</md-option>
    <md-option value="BM">Bermuda</md-option>
    <md-option value="BT">Bhutan</md-option>
    <md-option value="BO">Bolivia, Plurinational State of</md-option>
    <md-option value="BQ">Bonaire, Sint Eustatius and Saba</md-option>
    <md-option value="BA">Bosnia and Herzegovina</md-option>
    <md-option value="BW">Botswana</md-option>
    <md-option value="BV">Bouvet Island</md-option>
    <md-option value="BR">Brazil</md-option>
    <md-option value="IO">British Indian Ocean Territory</md-option>
    <md-option value="BN">Brunei Darussalam</md-option>
    <md-option value="BG">Bulgaria</md-option>
    <md-option value="BF">Burkina Faso</md-option>
    <md-option value="BI">Burundi</md-option>
    <md-option value="KH">Cambodia</md-option>
    <md-option value="CM">Cameroon</md-option>
    <md-option value="CA">Canada</md-option>
    <md-option value="CV">Cape Verde</md-option>
    <md-option value="KY">Cayman Islands</md-option>
    <md-option value="CF">Central African Republic</md-option>
    <md-option value="TD">Chad</md-option>
    <md-option value="CL">Chile</md-option>
    <md-option value="CN">China</md-option>
    <md-option value="CX">Christmas Island</md-option>
    <md-option value="CC">Cocos (Keeling) Islands</md-option>
    <md-option value="CO">Colombia</md-option>
    <md-option value="KM">Comoros</md-option>
    <md-option value="CG">Congo</md-option>
    <md-option value="CD">Congo, the Democratic Republic of the</md-option>
    <md-option value="CK">Cook Islands</md-option>
    <md-option value="CR">Costa Rica</md-option>
    <md-option value="CI">Côte d'Ivoire</md-option>
    <md-option value="HR">Croatia</md-option>
    <md-option value="CU">Cuba</md-option>
    <md-option value="CW">Curaçao</md-option>
    <md-option value="CY">Cyprus</md-option>
    <md-option value="CZ">Czech Republic</md-option>
    <md-option value="DK">Danmark</md-option>
    <md-option value="DJ">Djibouti</md-option>
    <md-option value="DM">Dominica</md-option>
    <md-option value="DO">Dominican Republic</md-option>
    <md-option value="EC">Ecuador</md-option>
    <md-option value="EG">Egypt</md-option>
    <md-option value="SV">El Salvador</md-option>
    <md-option value="GQ">Equatorial Guinea</md-option>
    <md-option value="ER">Eritrea</md-option>
    <md-option value="EE">Estonia</md-option>
    <md-option value="ET">Ethiopia</md-option>
    <md-option value="FK">Falkland Islands (Malvinas)</md-option>
    <md-option value="FO">Faroe Islands</md-option>
    <md-option value="FJ">Fiji</md-option>
    <md-option value="FI">Finland</md-option>
    <md-option value="FR">France</md-option>
    <md-option value="GF">French Guiana</md-option>
    <md-option value="PF">French Polynesia</md-option>
    <md-option value="TF">French Southern Territories</md-option>
    <md-option value="GA">Gabon</md-option>
    <md-option value="GM">Gambia</md-option>
    <md-option value="GE">Georgia</md-option>
    <md-option value="DE">Germany</md-option>
    <md-option value="GH">Ghana</md-option>
    <md-option value="GI">Gibraltar</md-option>
    <md-option value="GR">Greece</md-option>
    <md-option value="GL">Greenland</md-option>
    <md-option value="GD">Grenada</md-option>
    <md-option value="GP">Guadeloupe</md-option>
    <md-option value="GU">Guam</md-option>
    <md-option value="GT">Guatemala</md-option>
    <md-option value="GG">Guernsey</md-option>
    <md-option value="GN">Guinea</md-option>
    <md-option value="GW">Guinea-Bissau</md-option>
    <md-option value="GY">Guyana</md-option>
    <md-option value="HT">Haiti</md-option>
    <md-option value="HM">Heard Island and McDonald Islands</md-option>
    <md-option value="VA">Holy See (Vatican City State)</md-option>
    <md-option value="HN">Honduras</md-option>
    <md-option value="HK">Hong Kong</md-option>
    <md-option value="HU">Hungary</md-option>
    <md-option value="IS">Iceland</md-option>
    <md-option value="IN">India</md-option>
    <md-option value="ID">Indonesia</md-option>
    <md-option value="IR">Iran, Islamic Republic of</md-option>
    <md-option value="IQ">Iraq</md-option>
    <md-option value="IE">Ireland</md-option>
    <md-option value="IM">Isle of Man</md-option>
    <md-option value="IL">Israel</md-option>
    <md-option value="IT">Italy</md-option>
    <md-option value="JM">Jamaica</md-option>
    <md-option value="JP">Japan</md-option>
    <md-option value="JE">Jersey</md-option>
    <md-option value="JO">Jordan</md-option>
    <md-option value="KZ">Kazakhstan</md-option>
    <md-option value="KE">Kenya</md-option>
    <md-option value="KI">Kiribati</md-option>
    <md-option value="KP">Korea, Democratic People's Republic of</md-option>
    <md-option value="KR">Korea, Republic of</md-option>
    <md-option value="KW">Kuwait</md-option>
    <md-option value="KG">Kyrgyzstan</md-option>
    <md-option value="LA">Lao People's Democratic Republic</md-option>
    <md-option value="LV">Latvia</md-option>
    <md-option value="LB">Lebanon</md-option>
    <md-option value="LS">Lesotho</md-option>
    <md-option value="LR">Liberia</md-option>
    <md-option value="LY">Libya</md-option>
    <md-option value="LI">Liechtenstein</md-option>
    <md-option value="LT">Lithuania</md-option>
    <md-option value="LU">Luxembourg</md-option>
    <md-option value="MO">Macao</md-option>
    <md-option value="MK">Macedonia, the former Yugoslav Republic of</md-option>
    <md-option value="MG">Madagascar</md-option>
    <md-option value="MW">Malawi</md-option>
    <md-option value="MY">Malaysia</md-option>
    <md-option value="MV">Maldives</md-option>
    <md-option value="ML">Mali</md-option>
    <md-option value="MT">Malta</md-option>
    <md-option value="MH">Marshall Islands</md-option>
    <md-option value="MQ">Martinique</md-option>
    <md-option value="MR">Mauritania</md-option>
    <md-option value="MU">Mauritius</md-option>
    <md-option value="YT">Mayotte</md-option>
    <md-option value="MX">Mexico</md-option>
    <md-option value="FM">Micronesia, Federated States of</md-option>
    <md-option value="MD">Moldova, Republic of</md-option>
    <md-option value="MC">Monaco</md-option>
    <md-option value="MN">Mongolia</md-option>
    <md-option value="ME">Montenegro</md-option>
    <md-option value="MS">Montserrat</md-option>
    <md-option value="MA">Morocco</md-option>
    <md-option value="MZ">Mozambique</md-option>
    <md-option value="MM">Myanmar</md-option>
    <md-option value="NA">Namibia</md-option>
    <md-option value="NR">Nauru</md-option>
    <md-option value="NP">Nepal</md-option>
    <md-option value="NL">Netherlands</md-option>
    <md-option value="NC">New Caledonia</md-option>
    <md-option value="NZ">New Zealand</md-option>
    <md-option value="NI">Nicaragua</md-option>
    <md-option value="NE">Niger</md-option>
    <md-option value="NG">Nigeria</md-option>
    <md-option value="NU">Niue</md-option>
    <md-option value="NF">Norfolk Island</md-option>
    <md-option value="MP">Northern Mariana Islands</md-option>
    <md-option value="NO">Norway</md-option>
    <md-option value="OM">Oman</md-option>
    <md-option value="PK">Pakistan</md-option>
    <md-option value="PW">Palau</md-option>
    <md-option value="PS">Palestinian Territory, Occupied</md-option>
    <md-option value="PA">Panama</md-option>
    <md-option value="PG">Papua New Guinea</md-option>
    <md-option value="PY">Paraguay</md-option>
    <md-option value="PE">Peru</md-option>
    <md-option value="PH">Philippines</md-option>
    <md-option value="PN">Pitcairn</md-option>
    <md-option value="PL">Poland</md-option>
    <md-option value="PT">Portugal</md-option>
    <md-option value="PR">Puerto Rico</md-option>
    <md-option value="QA">Qatar</md-option>
    <md-option value="RE">Réunion</md-option>
    <md-option value="RO">Romania</md-option>
    <md-option value="RU">Russian Federation</md-option>
    <md-option value="RW">Rwanda</md-option>
    <md-option value="BL">Saint Barthélemy</md-option>
    <md-option value="SH">Saint Helena, Ascension and Tristan da Cunha</md-option>
    <md-option value="KN">Saint Kitts and Nevis</md-option>
    <md-option value="LC">Saint Lucia</md-option>
    <md-option value="MF">Saint Martin (French part)</md-option>
    <md-option value="PM">Saint Pierre and Miquelon</md-option>
    <md-option value="VC">Saint Vincent and the Grenadines</md-option>
    <md-option value="WS">Samoa</md-option>
    <md-option value="SM">San Marino</md-option>
    <md-option value="ST">Sao Tome and Principe</md-option>
    <md-option value="SA">Saudi Arabia</md-option>
    <md-option value="SN">Senegal</md-option>
    <md-option value="RS">Serbia</md-option>
    <md-option value="SC">Seychelles</md-option>
    <md-option value="SL">Sierra Leone</md-option>
    <md-option value="SG">Singapore</md-option>
    <md-option value="SX">Sint Maarten (Dutch part)</md-option>
    <md-option value="SK">Slovakia</md-option>
    <md-option value="SI">Slovenia</md-option>
    <md-option value="SB">Solomon Islands</md-option>
    <md-option value="SO">Somalia</md-option>
    <md-option value="ZA">South Africa</md-option>
    <md-option value="GS">South Georgia and the South Sandwich Islands</md-option>
    <md-option value="SS">South Sudan</md-option>
    <md-option value="ES">Spain</md-option>
    <md-option value="LK">Sri Lanka</md-option>
    <md-option value="SD">Sudan</md-option>
    <md-option value="SR">Suriname</md-option>
    <md-option value="SJ">Svalbard and Jan Mayen</md-option>
    <md-option value="SZ">Swaziland</md-option>
    <md-option value="SE">Sweden</md-option>
    <md-option value="CH">Switzerland</md-option>
    <md-option value="SY">Syrian Arab Republic</md-option>
    <md-option value="TW">Taiwan, Province of China</md-option>
    <md-option value="TJ">Tajikistan</md-option>
    <md-option value="TZ">Tanzania, United Republic of</md-option>
    <md-option value="TH">Thailand</md-option>
    <md-option value="TL">Timor-Leste</md-option>
    <md-option value="TG">Togo</md-option>
    <md-option value="TK">Tokelau</md-option>
    <md-option value="TO">Tonga</md-option>
    <md-option value="TT">Trinidad and Tobago</md-option>
    <md-option value="TN">Tunisia</md-option>
    <md-option value="TR">Turkey</md-option>
    <md-option value="TM">Turkmenistan</md-option>
    <md-option value="TC">Turks and Caicos Islands</md-option>
    <md-option value="TV">Tuvalu</md-option>
    <md-option value="UG">Uganda</md-option>
    <md-option value="UA">Ukraine</md-option>
    <md-option value="AE">United Arab Emirates</md-option>
    <md-option value="GB">United Kingdom</md-option>
    <md-option value="US">United States</md-option>
    <md-option value="UM">United States Minor Outlying Islands</md-option>
    <md-option value="UY">Uruguay</md-option>
    <md-option value="UZ">Uzbekistan</md-option>
    <md-option value="VU">Vanuatu</md-option>
    <md-option value="VE">Venezuela, Bolivarian Republic of</md-option>
    <md-option value="VN">Viet Nam</md-option>
    <md-option value="VG">Virgin Islands, British</md-option>
    <md-option value="VI">Virgin Islands, U.S.</md-option>
    <md-option value="WF">Wallis and Futuna</md-option>
    <md-option value="EH">Western Sahara</md-option>
    <md-option value="YE">Yemen</md-option>
    <md-option value="ZM">Zambia</md-option>
    <md-option value="ZW">Zimbabwe</md-option>

  </md-select>
</template>

<script>
    export default {
        data() {
            return {
                form: {
                    country: this.country
                }
            }
        },
        props: ['country'],
        watch: {
            'form.country'(newCountry) {
                this.$emit('update:country', newCountry)
            },
            country(newPropCountry) {
                this.form.country = newPropCountry
            }
        }


    }
</script>
