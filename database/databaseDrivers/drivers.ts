import FirebaseFirestoreDriver from './FirebaseDirestoreDriver';
import FirebaseRTDBDriver from './FirebaseRTDBDriver';
import MySqlDriver from './MySqlDriver';
import MariaDbDriver from './MariaDbDriver';
import MongoDbDriver from './MongoDbDriver';
import DiskStorageDriver from './DiskStorageDriver';
import GCPDatastoreDriver from './GCPDatastoreDriver';

const drivers = {
    FirebaseFirestoreDriver,
    FirebaseRTDBDriver,
    MySqlDriver,
    MariaDbDriver,
    MongoDbDriver,
    DiskStorageDriver,
    GCPDatastoreDriver
};

export default drivers;
