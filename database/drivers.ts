import FirebaseFirestoreDriver from './drivers/FirebaseDirestoreDriver';
import FirebaseRTDBDriver from './drivers/FirebaseRTDBDriver';
import MySqlDriver from './drivers/MySqlDriver';
import MariaDbDriver from './drivers/MariaDbDriver';
import MongoDbDriver from './drivers/MongoDbDriver';
import DiskStorageDriver from './drivers/DiskStorageDriver';
import GCPDatastoreDriver from './drivers/GCPDatastoreDriver';

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
