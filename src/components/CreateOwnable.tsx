import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Button,
    Input, 
    Tab, 
    Tabs, 
    // TextField, 
    Typography,
} from '@mui/material';
import LTOService from "../services/LTO.service";
import useInterval from '../utils/useInterval';
import Dialog from "@mui/material/Dialog";
import JSZip from 'jszip';

import heic2any from 'heic2any';

interface CreateOwnableProps {
    open: boolean;
    onClose: () => void;
    
}

interface Ownable {
    owner: string;
    email: string;
    name: string;
    description: string;
    keywords: string[];
    ethereumAddress: string;
    network: string;
    image: File | null;
}

interface readyOwnable {
    name: string;
    status: string;
}

export default function CreateOwnable(props: CreateOwnableProps) {
    const { open, onClose } = props;
    const [activeTab, setActiveTab] = useState('build');
    const ltoWalletAddress =LTOService.address;
    // const [showNoBalance, setShowNoBalance] = useState(false);
    const [balance, setBalance] = useState<number>();
    const [ownable, setOwnable] = useState<Ownable>({
        owner: '',
        email: '',
        name: '',
        description: '',
        keywords: [],
        ethereumAddress: '',
        network: '',
        image: null,
    });
    // const [ownables, setOwnables] = useState<readyOwnable[]>([]);

    // useEffect(() => {
    //     // Fetch the list of importable ownables from the API
    //     // fetch('API_URL')
    //     fetch('HOST:3000/api/v1/ServerWalletAddressLTO')
    //         .then((response) => response.json())
    //         .then((data) => setOwnables(data));
    // }, []);

    const loadBalance = () => {
        if (!LTOService.isUnlocked()) return;
    
        LTOService.getBalance().then(({regular}) => setBalance(
          parseFloat((regular / 100000000).toFixed(2))
        ));
      }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    useEffect(() => loadBalance(), []);
    useInterval(() => loadBalance(), 5 * 1000)

    // useEffect(() => {
    //     if (balance !== undefined && balance < 0.1) {
    //       setShowNoBalance(true);
    //       return;
    //     }
    // },  [balance]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setOwnable((prevOwnable) => ({
            ...prevOwnable,
            [name]: value,
        }));
    };

    // Input keywords
    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const keywords = value.split(' ');
        setOwnable((prevOwnable) => ({
            ...prevOwnable,
            keywords,
        }));
    };    

    // reactTags keywords
    // const handleDelete = (i: number) => {
        //     setOwnable((prevOwnable) => ({
        //         ...prevOwnable,
        //         keywords: prevOwnable.keywords.filter((tag, index) => index !== i),
        //     }));
        // };
        
        // const handleAddition = (tag: any) => {
        //     setOwnable((prevOwnable) => ({
        //         ...prevOwnable,
        //         keywords: [...prevOwnable.keywords, tag.text],
        //     }));
        // };

    const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setOwnable((prevOwnable) => ({
            ...prevOwnable,
            network: value,
        }));
    };

    // const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0] || null;
    //     setOwnable((prevOwnable) => ({
    //         ...prevOwnable,
    //         image: file,
    //     }));
    // };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0] || null;
      
        if (file && file.type === 'image/heic') {
            const blob = await heic2any({
                blob: file,
                toType: 'image/png',
                quality: 0.7
            });
            if (blob instanceof Blob) {
                file = new File([blob], file.name, { type: 'image/png' });
            }
        }
            setOwnable((prevOwnable) => ({
                ...prevOwnable,
                image: file,
            }));
        }

    const handleCreateOwnable = () => {
        const walletInfo = {
            ltoWalletAddress,
            transactionId: '', // Replace with actual transaction ID
        }

        const formattedName = ownable.name
            .split(' ')
            .map((word, index) => index !== 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
            .join('')
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");

        const imageType = ownable.image ? ownable.image.type.split('/')[1] : '';
        const imageName = ownable.name.replace(/\s+/g, '-');

        const ownableData = [
            {
              "template": "template1",
              "NFT_BLOCKCHAIN": ownable.network,
              "NFT_PUBLIC_USER_WALLET_ADDRESS": ownable.ethereumAddress,
              "OWNABLE_THUMBNAIL": imageName+"."+imageType,
              "OWNABLE_LTO_TRANSACTION_ID": walletInfo.transactionId,
              "PLACEHOLDER1_NAME": "ownable-"+formattedName,
              "PLACEHOLDER1_DESCRIPTION": ownable.description,
              "PLACEHOLDER1_VERSION": "0.1.0",
              "PLACEHOLDER1_AUTHORS": ownable.owner + " <"+ownable.email+">",
              "PLACEHOLDER1_KEYWORDS": ownable.keywords,
              "PLACEHOLDER2_TITLE": ownable.name,
              "PLACEHOLDER2_IMG": imageName+"."+imageType,
              "PLACEHOLDER3_MSG": "ownable_"+formattedName,
            //   "PLACEHOLDER3_STATE": "ownable_storiedApes",
            //   "PLACEHOLDER3_STATE": "ownable_" + ownable.name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s+/g, "").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(""),
            "PLACEHOLDER3_STATE": "ownable_"+formattedName,  
            "PLACEHOLDER4_CONTRACT_NAME": "crates.io:ownable-"+formattedName,
              "PLACEHOLDER4_TYPE": ownable.name,
              "PLACEHOLDER4_DESCRIPTION": ownable.description,
              "PLACEHOLDER4_NAME": ownable.name
            }
          ];

        // Create a FormData object and append the JSON object and image file to it
        // const formData = new FormData();
        // formData.append('ownableData', JSON.stringify(ownableData, null, 2));
        // if (ownable.image) {
        //     formData.append('image', ownable.image);
        // }
        // console.log('formData', formData);
        // Zip the JSON object and image file
        const zip = new JSZip();
        zip.file('ownableData.json', JSON.stringify(ownableData, null, 2));
        if (ownable.image) {
            zip.file(`${imageName}.${imageType}`, ownable.image);
        } 
        // if (ownable.image) {
        //     const imageType = ownable.image.type.split('/')[1];
        //     zip.file(`image.${imageType}`, ownable.image);
        // }
        // if (ownable.image) {
        //     zip.file('image.jpg', ownable.image);
        // }
        console.log('zip', zip);
        // Generate the zip file
        zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = formattedName+'.zip'; // Set the desired file name
            // Simulate a click on the link to trigger the download
            link.click();
        });

        // const url = 'http://httpbin.org/post';
        // // Send via axios
        // axios.post(url, zip)
        // .then(res => {
        //     console.log(res.data)})
        // .catch(err => {
        //     console.log(err)});

        // // Generate the zip file and send it to the REST API
        // zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
        //     const formData = new FormData();
        //     formData.append('file', content, 'ownable.zip');
        //     // Send the zip file to the REST API
        //     fetch(url, {
        //         method: 'POST',
        //         body: formData,
        //     })
        //     .then((response) => response.json())
        //     .then((data) => {
        //         console.log(data);
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //       });
        // });
    }

        return (
            <>
            <Dialog onClose={onClose} open={open}>
                <Box sx={{ maxWidth: '90%', p: 2 }}>
                    <Box component="div" sx={{ mt: 2 }}>
                        <Typography sx={{ fontSize: 12 }} color="text.secondary">
                        LTO Network address
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }} component="div">
                        {ltoWalletAddress}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                        balance: {balance !== undefined ? balance + ' LTO' : ''}
                        </Typography>
                    </Box>
                    <Box component="div" sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Tabs value={activeTab} onChange={(event, value) => handleTabChange(value)}>
                        <Tab label="Build" value="build" sx={{ mr: { xs: 1, sm: 2 } }} />
                        <Tab label="Import" value="import" sx={{ ml: { xs: 1, sm: 2 } }} />
                        </Tabs>
                    </Box>
                    <br></br>
                    <Box>
                        {activeTab === 'build' && (
                        <Box component="div" sx={{ mt: 2 }}>
                            <Input
                            fullWidth
                            type="text"
                            name="owner"
                            placeholder="Owner name"
                            value={ownable.owner}
                            onChange={handleInputChange}
                            sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }}
                            />
                            <Input
                            fullWidth
                            type="email"
                            name="email"
                            placeholder="Owner email"
                            value={ownable.email}
                            onChange={handleInputChange}
                            sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }}
                            />
                        <Box component="div" sx={{ mt: 2 }}>
                            {/* <TextField */}
                            <Input
                            fullWidth
                            type="text"
                            name="name"
                            placeholder="Ownable name"
                            value={ownable.name}
                            onChange={handleInputChange}
                            sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }}
                            />
                            <br></br>
                            {/* <TextField */}
                            <Input
                            fullWidth
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={ownable.description}
                            onChange={handleInputChange}
                            sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }}
                            />
                            <br></br>
                            
                            {/* <TextField */}
                            <Input
                            fullWidth
                            type="text"
                            name="keywords"
                            placeholder="Keywords (separated by spaces)"
                            value={ownable.keywords.join(' ')}
                            onChange={handleKeywordsChange}
                            sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }}
                            />
                            {/* <Box component="div" className="my-custom-class" sx={{ mt: 2 }}>
                            <ReactTags
                                tags={ownable.keywords.map((keyword) => ({ id: keyword, text: keyword }))}
                                handleDelete={handleDelete}
                                handleAddition={handleAddition}
                                placeholder="Add new keyword"
                                allowDragDrop={false}
                                inputFieldPosition="top"
                                autofocus={false}
                            />
                            </Box> */}
                            <br></br>
                            <Input
                            fullWidth
                            type="text"
                            name="ethereumAddress"
                            placeholder="Ethereum Address"
                            value={ownable.ethereumAddress}
                            onChange={handleInputChange}
                            sx={{ fontSize: { xs: '0.8rem', sm: '1rem', md: '1.2rem' } }}
                            />
                            <br></br>
                            <br></br>
                            <select name="network" value={ownable.network} onChange={handleNetworkChange}>
                            <option value="">Select Network</option>
                            <option value="arbitrumSepolia">Arbitrum</option>
                            <option value="polygon">Polygon</option>
                            <option value="ethereum">Ethereum</option>
                            </select>
                            <br></br>
                            <br></br>
                            <input type="file" accept="image/*,.heic" onChange={handleImageUpload} />
                            <br></br>
                            {ownable.image && (
                            <img
                                src={URL.createObjectURL(ownable.image)}
                                alt="Selected"
                                style={{ width: '100px', height: 'auto' }}
                            />
                            )}
                            <Box component="div" sx={{ mt: 2 }}>
                                <Button sx={{ mt: 2 }} onClick={handleCreateOwnable}>
                                Create Ownable
                                </Button>
                            </Box>
                            </Box>
                        </Box>
                        )}
                        {activeTab === 'import' && (
                        <div>
                            {/* {ownables.length === 0 && (
                            <div>
                                <br></br>No ownables for import yet<br></br>
                                Build your first one
                            </div>
                            )}
                            {ownables.map((readyOwnable) => (
                            <div key={readyOwnable.name}>
                                <span>{readyOwnable.name}</span>
                                <span>{readyOwnable.status}</span>
                                <button>Download</button>
                            </div>
                            ))} */}
                        </div>
                        )}
                    </Box>
                </Box>
            </Dialog>
            </>
        );
}
