<template>
  <div class="activity">
    <div class="theme--frame-box">
      <h2 class="mb-3">
        {{ $t('profile.myActivityLabel') }}
      </h2>
      <chartbar
          :chartData="chartData"
          :height="300"
      ></chartbar>
    </div>
  </div>
</template>

<script>
import ChartBar from './ChartBar';
import moment from 'moment-timezone';
import _map from 'lodash/map';
import _uniqBy from 'lodash/uniqBy';
import _groupBy from 'lodash/groupBy';
import _find from 'lodash/find';
import _each from 'lodash/each';
import _concat from 'lodash/concat';
import _sortBy from 'lodash/sortBy';
import pattern from 'patternomaly';

import { mapGetters } from 'vuex';


export default {
  name: 'MyActivity',
  components: {
    chartbar: ChartBar,
  },
  data() {
    return {
      myActivityLabel: 'Min aktivitet',
    };
  },
  props: [
    'historicClassSignups',
    'historicClassLivestreamSignups',
  ],
  computed: {
    ...mapGetters([
      'client',
    ]),
    months() {
      let months = [];
      for (let i = 11; i >= 0; i--) {
        months.push(
            moment.tz('Europe/Copenhagen').startOf('month').subtract(i, 'months'),
        );
      }
      return months;
    },
    labels() {
      return _map(this.months, month => month.format('MMM').toUpperCase());
    },
    chartData() {
      const classTypes =
          _sortBy(
              _uniqBy(
                  _map(
                      _concat(
                          this.historicClassSignups,
                          this.historicClassLivestreamSignups,
                      ),
                      'class.class_type',
                  ),
                  'id',
              ),
              'name',
          );


      const signupsPerMonth = _groupBy(
          this.historicClassSignups,
          signup => signup.class.date.substr(0, 7),
      );

      const livestreamSignupsPerMonth = _groupBy(
          this.historicClassLivestreamSignups,
          livestreamSignup => livestreamSignup.class.date.substr(0, 7),
      );


      const datasets = [];
      _each(classTypes, (classType) => {
        const dataset = {
          label: classType.name,
          defaultFontStyle: 'bold',
          backgroundColor: classType.color,
          // pointBackgroundColor: 'white',
          borderWidth: 1,
        };
        dataset.data = _map(
            this.months,
            month => signupsPerMonth[month.format('YYYY-MM')]
                ? signupsPerMonth[month.format('YYYY-MM')].filter(
                    signup => signup.class.class_type.id === classType.id && !signup.class.cancelled,
                ).length
                : 0,
        );
        if (_find(dataset.data, n => n > 0)) {
          console.log(dataset, dataset.label);
          datasets.push(dataset);
        }

        const livestreamDataset = {
          label: classType.name + ', livestream',
          defaultFontStyle: 'bold',
          backgroundColor: pattern.draw(
              'zigzag-horizontal',
              classType.color,
              'rgba(255,255,255,0.6)',
              10,
          ),
          // pointBackgroundColor: 'white',
          borderWidth: 1,
        };
        livestreamDataset.data = _map(
            this.months,
            month => livestreamSignupsPerMonth[month.format('YYYY-MM')]
                ? livestreamSignupsPerMonth[month.format('YYYY-MM')].filter(
                    signup => signup.class.class_type.id === classType.id && !signup.class.cancelled,
                ).length
                : 0,
        );
        if (_find(livestreamDataset.data, n => n > 0)) {
          console.log(livestreamDataset, livestreamDataset.label);
          datasets.push(livestreamDataset);
        }
      });


      return {
        labels: this.labels,
        datasets,
      };
    },
  },
};
</script>


<style>


</style>
