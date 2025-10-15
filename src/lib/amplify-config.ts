import { Amplify } from 'aws-amplify';
import awsconfig from '../../amplifyconfiguration.json';

Amplify.configure(awsconfig, {
  ssr: true
});

export default Amplify;