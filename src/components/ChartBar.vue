<script>
import { Bar, mixins } from 'vue-chartjs';

export default {
  extends: Bar,
  mixins: [mixins.reactiveProp],
  name: 'ChartBar',
  data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            ticks: {
              stepSize: 1,
            },
            stacked: true,
          }],
        },
      },
    };
  },

  mounted() {
    this.renderChart(this.chartData, this.options);
  },
};
</script>
