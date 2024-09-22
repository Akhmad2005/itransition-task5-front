'use client'

import styles from './index.module.css'
import { Select, Button, Space, Slider, InputNumber, Input, Table, Row, Col, Divider, TableColumnProps, message } from 'antd'
import { Language } from '@/app/utilities/enums/languages'
import React, { useEffect, useRef, useState } from 'react'

interface Users {
	name: string,
	id: string,
  fullName: string,
  address: string,
  phoneNumber: string
}


const columns: TableColumnProps[] = [
	{
		title: 'Number',
		dataIndex: 'number',
		key: 'number',
		width: '100px'
	}, 
	{
		title: 'Identifier',
		dataIndex: 'id',
		key: 'id',
	},
	{
		title: 'Full name',
		dataIndex: 'fullName',
		key: 'fullName',
	},
	{
		title: 'Addres',
		dataIndex: 'address',
		key: 'address',
	},
	{
		title: 'Phone number',
		dataIndex: 'phoneNumber',
		key: 'phoneNumber',
	},
]

const HomeTable = () => {
	const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.England);
	const [mistakesSliderValue, setMistakesSliderValue] = useState<number>(0);
	const [mistakesInputValue, setMistakesInputValue] = useState<number>(0);
	const [data, setData] = useState<Users[]>();
	const [dataEnd, setDataEnd] = useState<boolean>(false);
	const [dataLoading, setDataLoading] = useState<boolean>(false);
	const [seed, setSeed] = useState<number>();
	const scrollDataLoading = useRef(false); 
	const dataLimit = useRef(10);
	const isMounted = useRef(false)
	const languageOptions = Object.entries(Language).map(([label, value]) => ({
    label,
    value,
  }));

	const handleLanguageChange = async (v: Language) => {
    setSelectedLanguage(v);
  };

	const handleSliderChange = (v: number) => {
		setMistakesSliderValue(v);
		setMistakesInputValue(v);
	}

	const handleSeedChange = (v: number | null) => {
		setSeed(v || undefined);
	}

	const handleMistakesInputChange = (v: number | null) => {
		if (v) {
			setMistakesInputValue(v);
			setMistakesSliderValue(Math.min(v, 10));
		} else {
			setMistakesInputValue(0);
      setMistakesSliderValue(0);
		}
	}

	const generateRandomSeed = (stringLength: number = 10) => {
		let randomSeed =  String(Math.random()).substring(2, 2 + stringLength);

		setSeed(Number(randomSeed));
	}

	const fetchList = async () => {
		setDataLoading(true);
		const params = new URLSearchParams({
			limit: String(dataLimit.current),
			region: String(selectedLanguage),
			errors: String(mistakesInputValue),
			seed: String(seed),
		});
		
		try {
			let res = await fetch(`https://itransition-task5-back.vercel.app/generate?${params.toString()}`)
			let data = await res.json()
			if (res && res.ok) {
				setData(data);
				if(data.length < 10) {
					setDataEnd(true);
				}
      } 
		} catch (error) {
			console.error('Error in fetching data:' + error);
		} finally {
			setDataLoading(false)
		}
	}

	function openCsvInNewTab(csvContent: any, fileName = 'Fake users') {
		const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const url = window.URL.createObjectURL(csvContent);
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', fileName);
	
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	
		window.URL.revokeObjectURL(url);
	}

	const epxortToCSV = async () => {
		setDataLoading(true);
		const params = new URLSearchParams({
			limit: String(dataLimit.current),
			region: String(selectedLanguage),
			errors: String(mistakesInputValue),
			seed: String(seed),
		});
		
		try {
			let res = await fetch(`https://itransition-task5-back.vercel.app/export?${params.toString()}`)
			if (res && res.ok) {
				let data = await res.blob();
				openCsvInNewTab(data)
				message.success('CSV successfully exported to CSV!')
      } 
		} catch (error) {
			console.error('Error in exporting csv:' + error);
		} finally {
			setDataLoading(false)
		}
	}

	const handleScroll = async (e: any) => {
		if (e) {
			const { scrollTop, scrollHeight, clientHeight } = e;
			if (scrollTop + clientHeight >= scrollHeight - 1 && !scrollDataLoading.current && !dataEnd) {
				scrollDataLoading.current = true;
				setDataLoading(true);
				setTimeout(() => {
					dataLimit.current += 10;
					// fetchList();
					setDataLoading(false);
				}, 1500);
			}
		}
		setTimeout(() => {
			scrollDataLoading.current = false;
		}, 10);
	};

	useEffect(() => {
		if (isMounted.current) {
			fetchList();
		} else {
			isMounted.current = true;
		} 
	}, [seed, mistakesInputValue, selectedLanguage, dataLimit.current]);

	useEffect(() => {
		const tableBody = document.querySelector('.ant-table-body')
		if (tableBody) {
			tableBody.addEventListener('scroll', () => {
				handleScroll(tableBody)
			});
		}
		fetchList()

		return () => {
			if (tableBody) {
				tableBody.removeEventListener('scroll', handleScroll);
			}
	};
	},[])
	
	return (
		<div className={styles['home-table']}>
			<div className={styles['home-table-toolbar']}>
				<Row  gutter={[8, 8]}>
					<Col >
						<Space direction='vertical'>
							<strong className={styles['home-table-toolbar-title']}>
								Region
							</strong>
							<Select 
								value={selectedLanguage} 
								onChange={(v) => handleLanguageChange(v)} 
								options={languageOptions} 
								style={{width: '200px'}} 
								placeholder='Select region'
							>

							</Select>
						</Space>
					</Col>
					<Col>
						<Divider type='vertical' className={styles.divider}/>
					</Col>
					<Col>
						<Space direction='vertical'>
							<strong className={styles['home-table-toolbar-title']}>
								Mistakes count
							</strong>
							<Space size={6}>
								<InputNumber 
									value={mistakesInputValue} 
									style={{width: '200px'}} 
									placeholder='Input mistakes count'
									max={1000}
									onChange={(v) => handleMistakesInputChange(v)}
									>
								</InputNumber>
								<Slider 
									value={mistakesSliderValue}
									onChange={(v) => handleSliderChange(v)} 
									style={{width: '200px'}} 
									step={0.25}  
									max={10}
									>
								</Slider>
							</Space>
						</Space>
					</Col>
					<Col>
						<Divider type='vertical' className={styles.divider}/>
					</Col>
					<Col flex={1}>
					</Col>
					<Col>
						<Divider type='vertical' className={styles.divider}/>
					</Col>
					<Col>
						<Space direction='vertical'>
							<strong className={styles['home-table-toolbar-title']}>
								Seed
							</strong>
							<Space size={6}>
								<InputNumber 
									style={{width: '200px'}}
									value={seed} 
									maxLength={10}
									placeholder='Input seed' 
									onChange={(v) => handleSeedChange(v)} 
								/>
								<Button onClick={() => generateRandomSeed()} type='primary'>
									Random
								</Button>
							</Space>
						</Space>
					</Col>
					<Col>
						<Divider type='vertical' className={styles.divider}/>
					</Col>
					<Col>
					  <Space direction='vertical'>
							<strong></strong>
							<Button onClick={() => epxortToCSV()} type='primary' style={{background: 'green'}}>
								Export to CSV
							</Button>
						</Space>
					</Col>	
				</Row>
			</div>
			<div className={styles['home-table-body']}>
				<Table
					loading={dataLoading}
					scroll={{
						y: 'calc(100vh - 300px)',
					}}
					pagination={
						false
					}
					columns={columns}
					dataSource={data}
					rowKey='id'
				>
				</Table>
			</div>
		</div>
	)
}

export default HomeTable